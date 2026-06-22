package jp.kyujinch.app.ui.theme

import androidx.compose.ui.graphics.Color

// Web 側のカラーパレット (Tailwind の hex リテラルから抽出)
// app/**/*.tsx の bg-[#xxx]/text-[#xxx] と一致させる
val Primary = Color(0xFF2F6CFF)               // bg-[#2f6cff]
val PrimaryDark = Color(0xFF1D63E3)            // ボタンなど濃い青
val PrimaryLightContainer = Color(0xFFEFF4FF) // bg-[#eff4ff]

val Secondary = Color(0xFFFF3158)              // bg-[#ff3158] バッジ等
val SecondaryAlt = Color(0xFFFF5A78)           // bg-[#ff5a78]

val Background = Color(0xFFF7F7F7)             // bg-[#f7f7f7] 画面背景
val Surface = Color(0xFFFFFFFF)                // カード白
val SurfaceVariant = Color(0xFFEFEFEF)         // bg-[#efefef] サブタグ等
val Border = Color(0xFFE8E8E8)                 // border-[#e8e8e8]
val BorderLight = Color(0xFFF0F0F0)            // border-[#f0f0f0]

val OnSurface = Color(0xFF1F2937)              // text-[#1f2937]
val OnSurfaceVariant = Color(0xFF6B7280)       // text-[#6b7280]
val OnSurfaceMuted = Color(0xFF9AA3B2)         // text-[#9aa3b2]
val OnSurfaceSubtle = Color(0xFF555555)        // text-[#555]

val Error = Color(0xFFEB0937)                  // text-[#eb0937] エラー
