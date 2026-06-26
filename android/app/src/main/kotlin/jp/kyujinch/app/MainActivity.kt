package jp.kyujinch.app

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Article
import androidx.compose.material.icons.automirrored.filled.Message
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.fragment.app.FragmentActivity
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.lifecycleScope
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInHorizontally
import androidx.compose.animation.slideOutHorizontally
import androidx.navigation.NavBackStackEntry
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import dagger.hilt.android.AndroidEntryPoint
import jp.kyujinch.app.core.analytics.Analytics
import jp.kyujinch.app.core.auth.BiometricAuthenticator
import jp.kyujinch.app.core.auth.BiometricStore
import jp.kyujinch.app.core.notification.DeepLinkBus
import jp.kyujinch.app.core.notification.NotificationHelper
import jp.kyujinch.app.feature.applications.ApplicationsListScreen
import jp.kyujinch.app.feature.applications.ApplyScreen
import jp.kyujinch.app.feature.auth.AuthViewModel
import jp.kyujinch.app.feature.auth.ForgotPasswordScreen
import jp.kyujinch.app.feature.auth.LoginScreen
import jp.kyujinch.app.feature.auth.RegisterScreen
import jp.kyujinch.app.feature.favorites.FavoritesScreen
import jp.kyujinch.app.feature.home.HomeScreen
import jp.kyujinch.app.feature.jobs.JobDetailScreen
import jp.kyujinch.app.feature.messages.ThreadDetailScreen
import jp.kyujinch.app.feature.messages.ThreadsListScreen
import jp.kyujinch.app.feature.profile.EditProfileScreen
import jp.kyujinch.app.feature.profile.ProfileScreen
import jp.kyujinch.app.feature.resume.ResumeScreen
import jp.kyujinch.app.feature.settings.WebContentScreen
import jp.kyujinch.app.feature.search.SearchScreen
import jp.kyujinch.app.feature.swipe.SwipeScreen
import jp.kyujinch.app.ui.theme.KyujinchTheme
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.launch
import javax.inject.Inject

@AndroidEntryPoint
class MainActivity : FragmentActivity() {

    @Inject lateinit var biometricStore: BiometricStore
    @Inject lateinit var analytics: Analytics

    private val requestNotificationPermission = registerForActivityResult(
        ActivityResultContracts.RequestPermission(),
    ) { /* 結果は無視 */ }

    override fun onCreate(savedInstanceState: Bundle?) {
        installSplashScreen()
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        NotificationHelper.ensureChannels(this)
        askNotificationPermission()

        emitDeepLinkFromIntent(intent)
        maybePromptBiometric()

        setContent {
            KyujinchTheme {
                Surface(modifier = Modifier.fillMaxSize()) {
                    AppRoot(analytics = analytics)
                }
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        emitDeepLinkFromIntent(intent)
    }

    private fun emitDeepLinkFromIntent(intent: Intent?) {
        val raw = intent?.getStringExtra("deepLink") ?: return
        lifecycleScope.launch { DeepLinkBus.emit(raw) }
    }

    private fun maybePromptBiometric() {
        lifecycleScope.launch {
            val enabled = biometricStore.enabledFlow.firstOrNull() ?: false
            if (!enabled) return@launch
            if (!BiometricAuthenticator.canAuthenticate(this@MainActivity)) return@launch
            BiometricAuthenticator.prompt(
                activity = this@MainActivity,
                onSuccess = { /* 通過 */ },
                onFailedFinal = { finish() },
            )
        }
    }

    private fun askNotificationPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            val granted = ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.POST_NOTIFICATIONS,
            ) == PackageManager.PERMISSION_GRANTED
            if (!granted) {
                requestNotificationPermission.launch(Manifest.permission.POST_NOTIFICATIONS)
            }
        }
    }
}

private object Routes {
    const val LOGIN = "login"
    const val REGISTER = "register"
    const val FORGOT_PASSWORD = "forgot-password"
    const val HOME = "home"
    const val SEARCH = "search"
    const val PROFILE = "profile"
    const val APPLICATIONS = "applications"
    const val FAVORITES = "favorites"
    const val MESSAGES = "messages"
    const val EDIT_PROFILE = "edit-profile"
    const val SWIPE = "swipe"
    const val RESUME = "resume"
    const val TERMS = "terms"
    const val PRIVACY = "privacy"
    const val JOB_DETAIL = "jobs/{id}"
    const val APPLY = "apply/{id}"
    const val THREAD_DETAIL = "threads/{id}"
    fun jobDetail(id: String) = "jobs/$id"
    fun apply(id: String) = "apply/$id"
    fun threadDetail(id: String) = "threads/$id"

    // デバッグ用: テスト求人 ID
    const val TEST_JOB_ID = "cmqlropd60002cppe403xawnd"
}

private data class TabItem(val route: String, val label: String, val icon: ImageVector)

// アプリ用 5 タブ構成 (ホームを先頭に追加。Web のロゴタップ→トップ相当)
private val TABS = listOf(
    TabItem(Routes.HOME, "ホーム", Icons.Default.Home),
    TabItem(Routes.APPLICATIONS, "応募済み", Icons.AutoMirrored.Filled.Article),
    TabItem(Routes.FAVORITES, "気になる", Icons.Default.Favorite),
    TabItem(Routes.MESSAGES, "メッセージ", Icons.AutoMirrored.Filled.Message),
    TabItem(Routes.PROFILE, "マイページ", Icons.Default.Person),
)

// Web の MobileNavBar と同じカラー (#eb0937 active, #aaa inactive)
private val BottomBarActive = Color(0xFFEB0937)
private val BottomBarInactive = Color(0xFFAAAAAA)

@Composable
private fun AppRoot(analytics: Analytics) {
    val rootNav = rememberNavController()
    val authVm: AuthViewModel = hiltViewModel()
    val isLoggedIn by authVm.isLoggedIn.collectAsState()

    // ルートナビ (login/register/forgot-password/main) の画面遷移をトラッキング
    val rootEntry by rootNav.currentBackStackEntryAsState()
    LaunchedEffect(rootEntry?.destination?.route) {
        val route = rootEntry?.destination?.route ?: return@LaunchedEffect
        screenNameFor(route)?.let { analytics.logScreenView(it) }
    }

    NavHost(
        navController = rootNav,
        startDestination = if (isLoggedIn) "main" else Routes.LOGIN,
    ) {
        composable(Routes.LOGIN) {
            LoginScreen(
                onLoginSuccess = {
                    rootNav.navigate("main") {
                        popUpTo(Routes.LOGIN) { inclusive = true }
                    }
                },
                onRegisterClick = { rootNav.navigate(Routes.REGISTER) },
                onForgotPasswordClick = { rootNav.navigate(Routes.FORGOT_PASSWORD) },
            )
        }
        composable(Routes.FORGOT_PASSWORD) {
            ForgotPasswordScreen(onBack = { rootNav.popBackStack() })
        }
        composable(Routes.REGISTER) {
            RegisterScreen(
                onBack = { rootNav.popBackStack() },
                onRegistered = {
                    rootNav.navigate("main") {
                        popUpTo(Routes.LOGIN) { inclusive = true }
                    }
                },
                onTerms = { /* TODO 開く */ },
                onPrivacy = { /* TODO 開く */ },
            )
        }
        composable("main") {
            MainShell(
                onLoggedOut = {
                    rootNav.navigate(Routes.LOGIN) {
                        popUpTo("main") { inclusive = true }
                    }
                },
                analytics = analytics,
            )
        }
    }
}

@Composable
private fun MainShell(onLoggedOut: () -> Unit, analytics: Analytics) {
    val nav = rememberNavController()
    val currentEntry by nav.currentBackStackEntryAsState()
    val currentRoute = currentEntry?.destination?.route

    LaunchedEffect(Unit) {
        DeepLinkBus.events.collect { raw -> handleDeepLink(raw, nav) }
    }

    // 画面遷移トラッキング
    LaunchedEffect(currentRoute) {
        currentRoute?.let { screenNameFor(it) }?.let { analytics.logScreenView(it) }
    }

    // ボトムバーを出すルート (タブ + ホーム + 検索)
    val showBottomBar = currentRoute in (TABS.map { it.route } + Routes.HOME + Routes.SEARCH)

    Scaffold(
        bottomBar = {
            if (showBottomBar) BottomBar(nav)
        },
    ) { padding ->
        NavHost(
            navController = nav,
            startDestination = Routes.HOME,
            modifier = Modifier.fillMaxSize().padding(padding),
            // タブ切替は短時間 fade、push 遷移はスライド
            enterTransition = { slideInHorizontally(tween(220)) { it / 4 } + fadeIn(tween(220)) },
            exitTransition = { fadeOut(tween(180)) },
            popEnterTransition = { fadeIn(tween(180)) },
            popExitTransition = { slideOutHorizontally(tween(220)) { it / 4 } + fadeOut(tween(220)) },
        ) {
            composable(Routes.HOME) {
                HomeScreen(
                    onJobClick = { id -> nav.navigate(Routes.jobDetail(id)) },
                    onCategoryClick = {
                        nav.navigate(Routes.SEARCH) { launchSingleTop = true }
                    },
                    onSwipeClick = { nav.navigate(Routes.SWIPE) },
                )
            }
            composable(Routes.SWIPE) {
                SwipeScreen(
                    onBack = { nav.popBackStack() },
                    onEditProfile = { nav.navigate(Routes.EDIT_PROFILE) },
                )
            }
            composable(Routes.SEARCH) {
                SearchScreen(onJobClick = { id -> nav.navigate(Routes.jobDetail(id)) })
            }
            composable(Routes.APPLICATIONS) {
                ApplicationsListScreen(onJobClick = { id -> nav.navigate(Routes.jobDetail(id)) })
            }
            composable(Routes.MESSAGES) {
                ThreadsListScreen(onThreadClick = { id -> nav.navigate(Routes.threadDetail(id)) })
            }
            composable(Routes.FAVORITES) {
                FavoritesScreen(
                    onJobClick = { id -> nav.navigate(Routes.jobDetail(id)) },
                )
            }
            composable(Routes.PROFILE) {
                ProfileScreen(
                    onLoggedOut = onLoggedOut,
                    onFavoritesClick = { nav.navigate(Routes.FAVORITES) },
                    onEditProfileClick = { nav.navigate(Routes.EDIT_PROFILE) },
                    onResumeClick = { nav.navigate(Routes.RESUME) },
                    onTermsClick = { nav.navigate(Routes.TERMS) },
                    onPrivacyClick = { nav.navigate(Routes.PRIVACY) },
                    onTestJobClick = { nav.navigate(Routes.jobDetail(Routes.TEST_JOB_ID)) },
                )
            }
            composable(Routes.EDIT_PROFILE) {
                EditProfileScreen(onBack = { nav.popBackStack() })
            }
            composable(Routes.RESUME) {
                ResumeScreen(onBack = { nav.popBackStack() })
            }
            composable(Routes.TERMS) {
                WebContentScreen(
                    title = "利用規約",
                    url = "https://kyujin-ch.jp/kiyaku",
                    onBack = { nav.popBackStack() },
                )
            }
            composable(Routes.PRIVACY) {
                WebContentScreen(
                    title = "プライバシーポリシー",
                    url = "https://kyujin-ch.jp/privacy",
                    onBack = { nav.popBackStack() },
                )
            }
            composable(Routes.JOB_DETAIL) {
                JobDetailScreen(
                    onBack = { nav.popBackStack() },
                    onApplyClick = { jobId -> nav.navigate(Routes.apply(jobId)) },
                )
            }
            composable(Routes.APPLY) {
                ApplyScreen(
                    onBack = { nav.popBackStack() },
                    onSubmitted = {
                        nav.navigate(Routes.APPLICATIONS) { popUpTo(Routes.HOME) }
                    },
                    onEditProfile = { nav.navigate(Routes.EDIT_PROFILE) },
                )
            }
            composable(Routes.THREAD_DETAIL) {
                ThreadDetailScreen(onBack = { nav.popBackStack() })
            }
        }
    }
}

/** Compose Navigation の route 文字列を Firebase Analytics の screen_name に変換 */
private fun screenNameFor(route: String): String? = when {
    route == Routes.LOGIN -> "login"
    route == Routes.REGISTER -> "register"
    route == Routes.FORGOT_PASSWORD -> "forgot_password"
    route == "main" -> null // main は単なるコンテナで個別画面ではない
    route == Routes.HOME -> "home"
    route == Routes.SEARCH -> "search"
    route == Routes.APPLICATIONS -> "applications"
    route == Routes.MESSAGES -> "messages_list"
    route == Routes.PROFILE -> "profile"
    route == Routes.FAVORITES -> "favorites"
    route == Routes.EDIT_PROFILE -> "profile_edit"
    route == Routes.RESUME -> "resume_edit"
    route == Routes.SWIPE -> "swipe"
    route == Routes.TERMS -> "terms"
    route == Routes.PRIVACY -> "privacy"
    route == Routes.JOB_DETAIL -> "job_detail"
    route == Routes.APPLY -> "apply"
    route == Routes.THREAD_DETAIL -> "message_thread"
    else -> null
}

private fun handleDeepLink(raw: String, nav: NavHostController) {
    when {
        raw.startsWith("thread/") -> nav.navigate(Routes.threadDetail(raw.removePrefix("thread/"))) {
            launchSingleTop = true
        }
        raw.startsWith("job/") -> nav.navigate(Routes.jobDetail(raw.removePrefix("job/"))) {
            launchSingleTop = true
        }
        raw == "applications" -> nav.navigate(Routes.APPLICATIONS) { launchSingleTop = true }
        raw == "messages" -> nav.navigate(Routes.MESSAGES) { launchSingleTop = true }
    }
}

@Composable
private fun BottomBar(nav: NavHostController) {
    val currentEntry by nav.currentBackStackEntryAsState()
    val currentDest = currentEntry?.destination

    NavigationBar(
        containerColor = Color.White,
        contentColor = BottomBarInactive,
        tonalElevation = 0.dp,
    ) {
        TABS.forEach { tab ->
            val selected = currentDest?.hierarchy?.any { it.route == tab.route } == true
            NavigationBarItem(
                selected = selected,
                onClick = {
                    nav.navigate(tab.route) {
                        popUpTo(nav.graph.findStartDestination().id) { saveState = true }
                        launchSingleTop = true
                        restoreState = true
                    }
                },
                icon = { Icon(tab.icon, contentDescription = tab.label) },
                label = { Text(tab.label, fontSize = 10.sp) },
                colors = NavigationBarItemDefaults.colors(
                    selectedIconColor = BottomBarActive,
                    selectedTextColor = BottomBarActive,
                    unselectedIconColor = BottomBarInactive,
                    unselectedTextColor = BottomBarInactive,
                    indicatorColor = Color.Transparent,
                ),
            )
        }
    }
}

