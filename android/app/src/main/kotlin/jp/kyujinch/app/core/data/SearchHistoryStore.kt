package jp.kyujinch.app.core.data

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringSetPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

private val Context.searchHistoryDataStore by preferencesDataStore(name = "search_history")

/**
 * 検索キーワード履歴 (最大10件)。
 * 新しい順にソート、重複は最新位置に。
 */
@Singleton
class SearchHistoryStore @Inject constructor(
    @ApplicationContext private val context: Context,
) {
    private val key = stringSetPreferencesKey("queries")
    private val limit = 10

    val queriesFlow: Flow<List<String>> = context.searchHistoryDataStore.data.map { prefs ->
        // Set なので順序が保証されない → タイムスタンプ付き文字列で保存
        val entries = prefs[key] ?: emptySet()
        entries.mapNotNull { line ->
            val parts = line.split("|", limit = 2)
            if (parts.size == 2) parts[0].toLongOrNull()?.let { ts -> ts to parts[1] } else null
        }
            .sortedByDescending { it.first }
            .map { it.second }
    }

    suspend fun add(query: String) {
        val trimmed = query.trim()
        if (trimmed.isEmpty()) return
        context.searchHistoryDataStore.edit { prefs ->
            val entries = (prefs[key] ?: emptySet()).toMutableSet()
            // 既存の同じクエリは除去
            entries.removeAll { it.endsWith("|$trimmed") }
            entries.add("${System.currentTimeMillis()}|$trimmed")
            // 古い順に切る
            val sorted = entries.mapNotNull { line ->
                val parts = line.split("|", limit = 2)
                if (parts.size == 2) parts[0].toLongOrNull()?.let { ts -> ts to line } else null
            }
                .sortedByDescending { it.first }
                .take(limit)
                .map { it.second }
                .toSet()
            prefs[key] = sorted
        }
    }

    suspend fun clear() {
        context.searchHistoryDataStore.edit { it.remove(key) }
    }
}
