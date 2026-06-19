package jp.kyujinch.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import dagger.hilt.android.AndroidEntryPoint
import jp.kyujinch.app.feature.auth.AuthViewModel
import jp.kyujinch.app.feature.auth.LoginScreen
import jp.kyujinch.app.feature.favorites.FavoritesScreen
import jp.kyujinch.app.feature.home.HomeScreen
import jp.kyujinch.app.feature.jobs.JobDetailScreen
import jp.kyujinch.app.feature.profile.ProfileScreen
import jp.kyujinch.app.ui.theme.KyujinchTheme

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            KyujinchTheme {
                Surface(modifier = Modifier.fillMaxSize()) {
                    AppRoot()
                }
            }
        }
    }
}

private object Routes {
    const val LOGIN = "login"
    const val HOME = "home"
    const val SEARCH = "search"
    const val FAVORITES = "favorites"
    const val PROFILE = "profile"
    const val JOB_DETAIL = "jobs/{id}"
    fun jobDetail(id: String) = "jobs/$id"
}

private data class TabItem(val route: String, val label: String, val icon: ImageVector)

private val TABS = listOf(
    TabItem(Routes.HOME, "ホーム", Icons.Default.Home),
    TabItem(Routes.SEARCH, "検索", Icons.Default.Search),
    TabItem(Routes.FAVORITES, "お気に入り", Icons.Default.Favorite),
    TabItem(Routes.PROFILE, "マイページ", Icons.Default.Person),
)

@Composable
private fun AppRoot() {
    val rootNav = rememberNavController()
    val authVm: AuthViewModel = hiltViewModel()
    val isLoggedIn by authVm.isLoggedIn.collectAsState()

    NavHost(
        navController = rootNav,
        startDestination = if (isLoggedIn) "main" else Routes.LOGIN,
    ) {
        composable(Routes.LOGIN) {
            LoginScreen(onLoginSuccess = {
                rootNav.navigate("main") {
                    popUpTo(Routes.LOGIN) { inclusive = true }
                }
            })
        }
        composable("main") {
            MainShell(onLoggedOut = {
                rootNav.navigate(Routes.LOGIN) {
                    popUpTo("main") { inclusive = true }
                }
            })
        }
    }
}

@Composable
private fun MainShell(onLoggedOut: () -> Unit) {
    val nav = rememberNavController()
    val currentEntry by nav.currentBackStackEntryAsState()
    val currentRoute = currentEntry?.destination?.route

    Scaffold(
        bottomBar = {
            if (currentRoute in TABS.map { it.route }) {
                BottomBar(nav)
            }
        },
    ) { padding ->
        NavHost(
            navController = nav,
            startDestination = Routes.HOME,
            modifier = Modifier.fillMaxSize().padding(padding),
        ) {
            composable(Routes.HOME) {
                HomeScreen(onJobClick = { id -> nav.navigate(Routes.jobDetail(id)) })
            }
            composable(Routes.SEARCH) {
                jp.kyujinch.app.feature.search.SearchScreen(
                    onJobClick = { id -> nav.navigate(Routes.jobDetail(id)) },
                )
            }
            composable(Routes.FAVORITES) {
                FavoritesScreen(onJobClick = { id -> nav.navigate(Routes.jobDetail(id)) })
            }
            composable(Routes.PROFILE) {
                ProfileScreen(onLoggedOut = onLoggedOut)
            }
            composable(Routes.JOB_DETAIL) {
                JobDetailScreen(onBack = { nav.popBackStack() })
            }
        }
    }
}

@Composable
private fun BottomBar(nav: NavHostController) {
    val currentEntry by nav.currentBackStackEntryAsState()
    val currentDest = currentEntry?.destination

    NavigationBar {
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
                label = { Text(tab.label) },
            )
        }
    }
}
