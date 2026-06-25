package jp.kyujinch.app.feature.profile

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.ui.draw.clip
import coil.compose.AsyncImage
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.foundation.layout.Column
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel

@Composable
private fun ToggleRow(
    title: String,
    subtitle: String,
    checked: Boolean,
    onChange: (Boolean) -> Unit,
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(title, fontSize = 14.sp)
            Text(subtitle, fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
        Switch(checked = checked, onCheckedChange = onChange)
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EditProfileScreen(
    onBack: () -> Unit,
    viewModel: EditProfileViewModel = hiltViewModel(),
) {
    val state by viewModel.ui.collectAsState()

    LaunchedEffect(state.saved) {
        if (state.saved) onBack()
    }

    val pickImage = rememberLauncherForActivityResult(
        ActivityResultContracts.PickVisualMedia(),
    ) { uri ->
        if (uri != null) viewModel.uploadAvatar(uri)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("プロフィール編集", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "戻る")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = androidx.compose.ui.graphics.Color.White,
                    titleContentColor = androidx.compose.ui.graphics.Color(0xFF1F2937),
                    navigationIconContentColor = androidx.compose.ui.graphics.Color(0xFF1F2937),
                ),
            )
        },
    ) { padding ->
        Box(Modifier.fillMaxSize().padding(padding)) {
            if (state.isLoading) {
                CircularProgressIndicator(Modifier.align(Alignment.Center))
            } else {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(20.dp)
                        .verticalScroll(rememberScrollState()),
                    verticalArrangement = Arrangement.spacedBy(14.dp),
                ) {
                    // アバター
                    Column(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalAlignment = Alignment.CenterHorizontally,
                    ) {
                        Box(
                            modifier = Modifier
                                .size(96.dp)
                                .clip(CircleShape)
                                .clickable(enabled = !state.isUploadingAvatar) {
                                    pickImage.launch(
                                        PickVisualMediaRequest(
                                            ActivityResultContracts.PickVisualMedia.ImageOnly,
                                        ),
                                    )
                                },
                            contentAlignment = Alignment.Center,
                        ) {
                            if (state.avatarUrl != null) {
                                AsyncImage(
                                    model = state.avatarUrl,
                                    contentDescription = "アバター",
                                    modifier = Modifier.fillMaxSize(),
                                    contentScale = androidx.compose.ui.layout.ContentScale.Crop,
                                )
                            } else {
                                Box(
                                    modifier = Modifier
                                        .fillMaxSize()
                                        .background(MaterialTheme.colorScheme.primary, CircleShape),
                                    contentAlignment = Alignment.Center,
                                ) {
                                    Text("画像", color = androidx.compose.ui.graphics.Color.White, fontSize = 12.sp)
                                }
                            }
                            if (state.isUploadingAvatar) {
                                CircularProgressIndicator(modifier = Modifier.size(40.dp))
                            }
                        }
                        Spacer(Modifier.height(6.dp))
                        Text(
                            "タップして画像を変更",
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.clickable {
                                pickImage.launch(
                                    PickVisualMediaRequest(
                                        ActivityResultContracts.PickVisualMedia.ImageOnly,
                                    ),
                                )
                            },
                        )
                    }

                    Text("氏名", fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedTextField(
                            value = state.lastName,
                            onValueChange = viewModel::setLastName,
                            label = { Text("姓") },
                            modifier = Modifier.weight(1f),
                            singleLine = true,
                        )
                        OutlinedTextField(
                            value = state.firstName,
                            onValueChange = viewModel::setFirstName,
                            label = { Text("名") },
                            modifier = Modifier.weight(1f),
                            singleLine = true,
                        )
                    }

                    Text("フリガナ", fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedTextField(
                            value = state.lastNameKana,
                            onValueChange = viewModel::setLastNameKana,
                            label = { Text("セイ") },
                            modifier = Modifier.weight(1f),
                            singleLine = true,
                        )
                        OutlinedTextField(
                            value = state.firstNameKana,
                            onValueChange = viewModel::setFirstNameKana,
                            label = { Text("メイ") },
                            modifier = Modifier.weight(1f),
                            singleLine = true,
                        )
                    }

                    OutlinedTextField(
                        value = state.phone,
                        onValueChange = viewModel::setPhone,
                        label = { Text("電話番号") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                    )

                    OutlinedTextField(
                        value = state.postalCode,
                        onValueChange = viewModel::setPostalCode,
                        label = { Text("郵便番号") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                    )

                    OutlinedTextField(
                        value = state.prefecture,
                        onValueChange = viewModel::setPrefecture,
                        label = { Text("都道府県") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                    )

                    OutlinedTextField(
                        value = state.cityTown,
                        onValueChange = viewModel::setCityTown,
                        label = { Text("市区町村") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                    )

                    OutlinedTextField(
                        value = state.addressLine,
                        onValueChange = viewModel::setAddressLine,
                        label = { Text("番地・建物名") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                    )

                    Spacer(Modifier.height(8.dp))
                    Text("通知設定", fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
                    ToggleRow(
                        title = "メール通知を受け取る",
                        subtitle = "応募やメッセージのメール通知",
                        checked = state.notificationsEnabled,
                        onChange = viewModel::setNotifications,
                    )
                    ToggleRow(
                        title = "メッセージ通知",
                        subtitle = "企業からのメッセージ受信時にプッシュ",
                        checked = state.notifyMessages,
                        onChange = viewModel::setNotifyMessages,
                    )
                    ToggleRow(
                        title = "応募ステータス通知",
                        subtitle = "選考状況の変更時にプッシュ",
                        checked = state.notifyApplications,
                        onChange = viewModel::setNotifyApplications,
                    )
                    ToggleRow(
                        title = "お知らせ・キャンペーン",
                        subtitle = "新機能やおすすめ情報のプッシュ",
                        checked = state.notifyMarketing,
                        onChange = viewModel::setNotifyMarketing,
                    )

                    Spacer(Modifier.height(4.dp))
                    val context = androidx.compose.ui.platform.LocalContext.current
                    androidx.compose.material3.OutlinedButton(
                        onClick = {
                            val intent = android.content.Intent(android.provider.Settings.ACTION_APP_NOTIFICATION_SETTINGS)
                                .putExtra(android.provider.Settings.EXTRA_APP_PACKAGE, context.packageName)
                            context.startActivity(intent)
                        },
                        modifier = Modifier.fillMaxWidth(),
                    ) {
                        Text("プッシュ通知の詳細設定 (システム)", fontSize = 13.sp)
                    }

                    state.error?.let {
                        Text(it, color = MaterialTheme.colorScheme.error, fontSize = 13.sp)
                    }

                    Spacer(Modifier.height(8.dp))

                    Button(
                        onClick = viewModel::save,
                        enabled = !state.isSaving,
                        modifier = Modifier.fillMaxWidth(),
                    ) {
                        if (state.isSaving) {
                            CircularProgressIndicator(
                                modifier = Modifier.height(20.dp),
                                strokeWidth = 2.dp,
                            )
                        } else {
                            Text("保存する", fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }
}
