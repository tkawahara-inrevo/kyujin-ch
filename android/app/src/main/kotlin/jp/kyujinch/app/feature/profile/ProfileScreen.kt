package jp.kyujinch.app.feature.profile

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import coil.compose.AsyncImage
import jp.kyujinch.app.core.network.UserProfile

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileScreen(
    onLoggedOut: () -> Unit,
    onFavoritesClick: () -> Unit = {},
    onEditProfileClick: () -> Unit = {},
    onResumeClick: () -> Unit = {},
    onTermsClick: () -> Unit = {},
    onPrivacyClick: () -> Unit = {},
    onTestJobClick: () -> Unit = {},
    viewModel: ProfileViewModel = hiltViewModel(),
) {
    val state by viewModel.ui.collectAsState()
    val biometricEnabled by viewModel.biometricEnabled.collectAsState()
    var showDeleteDialog by remember { mutableStateOf(false) }

    LaunchedEffect(state.loggedOut) {
        if (state.loggedOut) onLoggedOut()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("マイページ", fontWeight = FontWeight.Bold) },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = androidx.compose.ui.graphics.Color.White,
                    titleContentColor = androidx.compose.ui.graphics.Color(0xFF1F2937),
                ),
            )
        },
    ) { padding ->
        Box(Modifier.fillMaxSize().padding(padding)) {
            when {
                state.isLoading -> CircularProgressIndicator(Modifier.align(Alignment.Center))
                state.error != null -> Text(
                    state.error!!,
                    color = MaterialTheme.colorScheme.error,
                    modifier = Modifier.align(Alignment.Center).padding(24.dp),
                )
                state.user != null -> ProfileContent(
                    user = state.user!!,
                    onLogout = viewModel::logout,
                    onDeleteRequest = { showDeleteDialog = true },
                    onFavoritesClick = onFavoritesClick,
                    onEditProfileClick = onEditProfileClick,
                    onResumeClick = onResumeClick,
                    onTermsClick = onTermsClick,
                    onPrivacyClick = onPrivacyClick,
                    onTestJobClick = onTestJobClick,
                    biometricEnabled = biometricEnabled,
                    onBiometricChange = viewModel::setBiometric,
                )
            }
        }

        if (showDeleteDialog) {
            AlertDialog(
                onDismissRequest = { showDeleteDialog = false },
                title = { Text("アカウント削除") },
                text = { Text("退会するとアカウント情報は復元できません。本当に退会しますか？") },
                confirmButton = {
                    TextButton(onClick = {
                        showDeleteDialog = false
                        viewModel.deleteAccount()
                    }) {
                        Text("退会する", color = MaterialTheme.colorScheme.error)
                    }
                },
                dismissButton = {
                    TextButton(onClick = { showDeleteDialog = false }) { Text("キャンセル") }
                },
            )
        }
    }
}

@Composable
private fun ProfileContent(
    user: UserProfile,
    onLogout: () -> Unit,
    onDeleteRequest: () -> Unit,
    onFavoritesClick: () -> Unit,
    onEditProfileClick: () -> Unit,
    onResumeClick: () -> Unit,
    onTermsClick: () -> Unit,
    onPrivacyClick: () -> Unit,
    onTestJobClick: () -> Unit,
    biometricEnabled: Boolean,
    onBiometricChange: (Boolean) -> Unit,
) {
    Column(
        modifier = Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(20.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        if (user.avatarUrl != null) {
            AsyncImage(
                model = user.avatarUrl,
                contentDescription = "アバター",
                modifier = Modifier.size(96.dp).clip(CircleShape),
            )
        } else {
            Box(
                modifier = Modifier
                    .size(96.dp)
                    .clip(CircleShape)
                    .padding(0.dp),
                contentAlignment = Alignment.Center,
            ) {
                Box(
                    modifier = Modifier
                        .size(96.dp)
                        .clip(CircleShape),
                    contentAlignment = Alignment.Center,
                ) {
                    Text(
                        text = (user.name.firstOrNull()?.toString() ?: "?"),
                        fontSize = 36.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White,
                    )
                }
            }
        }

        Spacer(Modifier.height(16.dp))
        Text(user.name, fontSize = 20.sp, fontWeight = FontWeight.Bold)
        Spacer(Modifier.height(4.dp))
        Text(user.email, fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)

        Spacer(Modifier.height(24.dp))

        Card(
            modifier = Modifier.fillMaxWidth(),
            elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
        ) {
            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Row(label = "氏名", value = user.name)
                Row(label = "電話番号", value = user.phone ?: "-")
                Row(label = "都道府県", value = user.prefecture ?: "-")
                Row(label = "市区町村", value = user.cityTown ?: "-")
                Row(label = "住所", value = user.addressLine ?: "-")
                Row(label = "通知", value = if (user.notificationsEnabled) "ON" else "OFF")
            }
        }

        Spacer(Modifier.height(16.dp))

        Card(
            modifier = Modifier.fillMaxWidth(),
            elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
        ) {
            androidx.compose.foundation.layout.Row(
                modifier = Modifier.fillMaxWidth().padding(16.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
            ) {
                Column(modifier = Modifier.padding(end = 12.dp)) {
                    Text("起動時の生体認証", fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
                    Text("指紋・顔認証でアプリ起動時にロック", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
                androidx.compose.material3.Switch(
                    checked = biometricEnabled,
                    onCheckedChange = onBiometricChange,
                )
            }
        }

        Spacer(Modifier.height(24.dp))

        Button(
            onClick = onEditProfileClick,
            modifier = Modifier.fillMaxWidth(),
        ) {
            Text("プロフィールを編集")
        }

        Spacer(Modifier.height(12.dp))

        OutlinedButton(
            onClick = onResumeClick,
            modifier = Modifier.fillMaxWidth(),
        ) {
            Text("履歴書を編集")
        }

        Spacer(Modifier.height(12.dp))

        OutlinedButton(
            onClick = onFavoritesClick,
            modifier = Modifier.fillMaxWidth(),
        ) {
            Text("お気に入り一覧")
        }

        if (jp.kyujinch.app.BuildConfig.DEBUG) {
            Spacer(Modifier.height(12.dp))
            OutlinedButton(
                onClick = onTestJobClick,
                modifier = Modifier.fillMaxWidth(),
            ) {
                Text("🧪 テスト求人を開く (DEBUG)")
            }
        }

        Spacer(Modifier.height(12.dp))

        Spacer(Modifier.height(12.dp))

        OutlinedButton(
            onClick = onTermsClick,
            modifier = Modifier.fillMaxWidth(),
        ) {
            Text("利用規約")
        }

        Spacer(Modifier.height(12.dp))

        OutlinedButton(
            onClick = onPrivacyClick,
            modifier = Modifier.fillMaxWidth(),
        ) {
            Text("プライバシーポリシー")
        }

        Spacer(Modifier.height(20.dp))

        Text(
            "バージョン ${jp.kyujinch.app.BuildConfig.VERSION_NAME}",
            fontSize = 11.sp,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )

        Spacer(Modifier.height(20.dp))

        OutlinedButton(
            onClick = onLogout,
            modifier = Modifier.fillMaxWidth(),
        ) {
            Text("ログアウト")
        }

        Spacer(Modifier.height(12.dp))

        Button(
            onClick = onDeleteRequest,
            modifier = Modifier.fillMaxWidth(),
            colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error),
        ) {
            Text("退会する", color = Color.White)
        }
    }
}

@Composable
private fun Row(label: String, value: String) {
    androidx.compose.foundation.layout.Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
    ) {
        Text(label, fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Text(value, fontSize = 13.sp)
    }
}
