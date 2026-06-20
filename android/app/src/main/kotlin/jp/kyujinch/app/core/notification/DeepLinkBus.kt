package jp.kyujinch.app.core.notification

import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.asSharedFlow

/**
 * Activity 経由で受け取った deep link を Composition 側に流すためのシンプルな bus。
 * MainActivity の onCreate / onNewIntent で emit、AppRoot で collect → ナビゲート。
 *
 * 形式の例:
 *   "thread/<id>"   メッセージスレッド詳細
 *   "job/<id>"      求人詳細
 *   "applications"  応募一覧
 */
object DeepLinkBus {
    private val _events = MutableSharedFlow<String>(replay = 1)
    val events: SharedFlow<String> = _events.asSharedFlow()

    suspend fun emit(raw: String) {
        _events.emit(raw)
    }
}
