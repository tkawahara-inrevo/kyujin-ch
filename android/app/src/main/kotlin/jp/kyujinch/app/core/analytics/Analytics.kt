package jp.kyujinch.app.core.analytics

import android.content.Context
import android.os.Bundle
import com.google.firebase.analytics.FirebaseAnalytics
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Firebase Analytics 用ラッパ。イベント名とパラメータを型安全に集約。
 */
@Singleton
class Analytics @Inject constructor(
    @ApplicationContext context: Context,
) {
    private val fa = FirebaseAnalytics.getInstance(context)

    fun logLogin(method: String = "password") {
        fa.logEvent(FirebaseAnalytics.Event.LOGIN, bundleOf(
            FirebaseAnalytics.Param.METHOD to method,
        ))
    }

    fun logRegister(method: String = "password") {
        fa.logEvent(FirebaseAnalytics.Event.SIGN_UP, bundleOf(
            FirebaseAnalytics.Param.METHOD to method,
        ))
    }

    fun logViewJob(jobId: String, source: String) {
        fa.logEvent(FirebaseAnalytics.Event.SELECT_CONTENT, bundleOf(
            FirebaseAnalytics.Param.CONTENT_TYPE to "job",
            FirebaseAnalytics.Param.ITEM_ID to jobId,
            "source" to source, // home / search / favorites / swipe / applications
        ))
    }

    fun logFavoriteToggle(jobId: String, isFavorite: Boolean) {
        fa.logEvent(if (isFavorite) "favorite_add" else "favorite_remove", bundleOf(
            FirebaseAnalytics.Param.ITEM_ID to jobId,
        ))
    }

    fun logApply(jobId: String, source: String) {
        fa.logEvent("apply_job", bundleOf(
            FirebaseAnalytics.Param.ITEM_ID to jobId,
            "source" to source, // detail / swipe
        ))
    }

    fun logSwipe(jobId: String, direction: String) {
        fa.logEvent("swipe_card", bundleOf(
            FirebaseAnalytics.Param.ITEM_ID to jobId,
            "direction" to direction, // left / right
        ))
    }

    fun logSendMessage(threadId: String) {
        fa.logEvent("send_message", bundleOf("thread_id" to threadId))
    }

    fun logSearch(query: String?, filterCount: Int) {
        fa.logEvent(FirebaseAnalytics.Event.SEARCH, bundleOf(
            FirebaseAnalytics.Param.SEARCH_TERM to (query ?: ""),
            "filter_count" to filterCount.toLong(),
        ))
    }

    fun logScreenView(screenName: String) {
        fa.logEvent(FirebaseAnalytics.Event.SCREEN_VIEW, bundleOf(
            FirebaseAnalytics.Param.SCREEN_NAME to screenName,
        ))
    }
}

private fun bundleOf(vararg pairs: Pair<String, Any>): Bundle = Bundle().apply {
    pairs.forEach { (k, v) ->
        when (v) {
            is String -> putString(k, v)
            is Int -> putInt(k, v)
            is Long -> putLong(k, v)
            is Boolean -> putBoolean(k, v)
            is Double -> putDouble(k, v)
            else -> putString(k, v.toString())
        }
    }
}
