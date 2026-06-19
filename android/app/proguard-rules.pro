# Add project specific ProGuard rules here.

# Kotlinx Serialization
-keepattributes *Annotation*, InnerClasses
-dontnote kotlinx.serialization.AnnotationsKt
-keep,includedescriptorclasses class jp.kyujinch.app.**$$serializer { *; }
-keepclassmembers class jp.kyujinch.app.** {
    *** Companion;
}
-keepclasseswithmembers class jp.kyujinch.app.** {
    kotlinx.serialization.KSerializer serializer(...);
}

# Retrofit
-dontwarn javax.annotation.**
-dontwarn kotlin.Unit
-dontwarn retrofit2.KotlinExtensions

# OkHttp
-dontwarn okhttp3.**
-dontwarn okio.**
