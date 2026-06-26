package jp.kyujinch.app.core.data

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Locale
import javax.inject.Inject
import javax.inject.Singleton

private val Context.dailyPromoStore by preferencesDataStore(name = "daily_promo")

/**
 * 「本日のおすすめ求人」モーダルを当日表示済みか管理する DataStore。
 * 日次でリセット (JST 基準で 0:00 切替)。
 */
@Singleton
class DailyPromoStore @Inject constructor(
    @ApplicationContext private val context: Context,
) {
    private val key = stringPreferencesKey("last_shown_date") // yyyy-MM-dd

    /** 今日のキー (JST) */
    private fun todayKey(): String {
        val fmt = SimpleDateFormat("yyyy-MM-dd", Locale.JAPAN)
        fmt.timeZone = java.util.TimeZone.getTimeZone("Asia/Tokyo")
        return fmt.format(Calendar.getInstance().time)
    }

    /** 今日まだモーダル未表示なら true */
    val shouldShowTodayFlow: Flow<Boolean> = context.dailyPromoStore.data.map { prefs ->
        val saved = prefs[key]
        saved != todayKey()
    }

    suspend fun markShownToday() {
        context.dailyPromoStore.edit { it[key] = todayKey() }
    }
}
