package jp.kyujinch.app.feature.auth

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ForgotPasswordScreen(
    onBack: () -> Unit,
    viewModel: ForgotPasswordViewModel = hiltViewModel(),
) {
    val state by viewModel.ui.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("パスワード再設定", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "戻る")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color.White,
                    titleContentColor = Color(0xFF1F2937),
                    navigationIconContentColor = Color(0xFF1F2937),
                ),
            )
        },
    ) { padding ->
        Box(Modifier.fillMaxSize().padding(padding)) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(24.dp)
                    .verticalScroll(rememberScrollState()),
            ) {
                if (state.sent) {
                    Text(
                        "メールを送信しました",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF16A34A),
                    )
                    Spacer(Modifier.height(8.dp))
                    Text(
                        "${state.email} 宛にパスワード再設定リンクを送信しました。" +
                            "メールが届かない場合は、迷惑メールフォルダもご確認ください。\n\n" +
                            "リンクの有効期限は60分です。",
                        fontSize = 13.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        lineHeight = 20.sp,
                    )
                    Spacer(Modifier.height(24.dp))
                    Button(
                        onClick = onBack,
                        modifier = Modifier.fillMaxWidth(),
                    ) {
                        Text("ログイン画面に戻る")
                    }
                } else {
                    Text(
                        "登録済みのメールアドレスを入力してください。" +
                            "パスワード再設定のリンクをお送りします。",
                        fontSize = 13.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        lineHeight = 20.sp,
                    )
                    Spacer(Modifier.height(16.dp))
                    OutlinedTextField(
                        value = state.email,
                        onValueChange = viewModel::setEmail,
                        label = { Text("メールアドレス") },
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                        modifier = Modifier.fillMaxWidth(),
                        enabled = !state.isSubmitting,
                    )
                    state.error?.let {
                        Spacer(Modifier.height(12.dp))
                        Text(it, color = MaterialTheme.colorScheme.error, fontSize = 13.sp)
                    }
                    Spacer(Modifier.height(24.dp))
                    Button(
                        onClick = viewModel::submit,
                        enabled = !state.isSubmitting,
                        modifier = Modifier.fillMaxWidth().height(48.dp),
                    ) {
                        if (state.isSubmitting) {
                            CircularProgressIndicator(modifier = Modifier.height(20.dp), strokeWidth = 2.dp)
                        } else {
                            Text("送信する", fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }
}
