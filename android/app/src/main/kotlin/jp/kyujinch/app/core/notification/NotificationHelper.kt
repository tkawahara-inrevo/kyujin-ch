package jp.kyujinch.app.core.notification

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat
import jp.kyujinch.app.MainActivity
import jp.kyujinch.app.R
import kotlin.random.Random

object NotificationHelper {

    private const val CHANNEL_GENERAL_ID = "general"
    private const val CHANNEL_MESSAGES_ID = "messages"

    fun ensureChannels(context: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val nm = ContextCompat.getSystemService(context, NotificationManager::class.java) ?: return

            val general = NotificationChannel(
                CHANNEL_GENERAL_ID,
                "お知らせ",
                NotificationManager.IMPORTANCE_DEFAULT,
            ).apply {
                description = "一般的な通知"
            }
            val messages = NotificationChannel(
                CHANNEL_MESSAGES_ID,
                "メッセージ",
                NotificationManager.IMPORTANCE_HIGH,
            ).apply {
                description = "企業からのメッセージ"
                enableVibration(true)
            }
            nm.createNotificationChannel(general)
            nm.createNotificationChannel(messages)
        }
    }

    fun show(
        context: Context,
        title: String,
        body: String,
        category: Category = Category.GENERAL,
        deepLink: String? = null,
    ) {
        ensureChannels(context)
        val channel = when (category) {
            Category.MESSAGE -> CHANNEL_MESSAGES_ID
            Category.GENERAL -> CHANNEL_GENERAL_ID
        }
        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            if (deepLink != null) putExtra("deepLink", deepLink)
        }
        val pi = PendingIntent.getActivity(
            context,
            Random.nextInt(),
            intent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT,
        )
        val notif = NotificationCompat.Builder(context, channel)
            .setSmallIcon(R.drawable.ic_notification)
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(NotificationCompat.BigTextStyle().bigText(body))
            .setPriority(
                if (category == Category.MESSAGE) NotificationCompat.PRIORITY_HIGH
                else NotificationCompat.PRIORITY_DEFAULT,
            )
            .setAutoCancel(true)
            .setContentIntent(pi)
            .build()

        val nm = ContextCompat.getSystemService(context, NotificationManager::class.java) ?: return
        nm.notify(Random.nextInt(), notif)
    }

    enum class Category { GENERAL, MESSAGE }
}
