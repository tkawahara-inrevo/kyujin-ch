package jp.kyujinch.app.core.notification

import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

/**
 * FCM プッシュ受信。
 * 後続 Phase で /devices にトークン登録 + 通知表示を実装。
 */
class PushService : FirebaseMessagingService() {
    override fun onNewToken(token: String) {
        super.onNewToken(token)
        // TODO: 認証後に /api/v1/devices へPOSTしてサーバーに紐付け
    }

    override fun onMessageReceived(message: RemoteMessage) {
        super.onMessageReceived(message)
        // TODO: NotificationCompat で通知表示
    }
}
