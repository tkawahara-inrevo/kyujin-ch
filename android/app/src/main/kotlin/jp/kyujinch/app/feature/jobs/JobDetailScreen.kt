package jp.kyujinch.app.feature.jobs

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.FavoriteBorder
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import coil.compose.AsyncImage
import jp.kyujinch.app.core.network.JobDetail
import jp.kyujinch.app.core.ui.ReportDialog

private val PrimaryBlue = Color(0xFF2F6CFF)
private val PrimaryBlueLight = Color(0xFFEFF4FF)
private val TextDark = Color(0xFF1F2937)
private val TextMuted = Color(0xFF6B7280)
private val BorderLight = Color(0xFFF0F0F0)
private val PageBg = Color(0xFFF7F7F7)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun JobDetailScreen(
    onBack: () -> Unit,
    onApplyClick: (String) -> Unit = {},
    viewModel: JobDetailViewModel = hiltViewModel(),
) {
    val state by viewModel.ui.collectAsState()
    var menuOpen by remember { mutableStateOf(false) }
    var showReportDialog by remember { mutableStateOf(false) }
    var showReportedSnack by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("求人詳細", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "戻る")
                    }
                },
                actions = {
                    state.job?.let { job ->
                        IconButton(onClick = viewModel::toggleFavorite) {
                            Icon(
                                imageVector = if (job.isFavorite) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
                                contentDescription = "お気に入り",
                                tint = if (job.isFavorite) Color(0xFFFF3158) else TextDark,
                            )
                        }
                        IconButton(onClick = { menuOpen = true }) {
                            Icon(Icons.Default.MoreVert, contentDescription = "メニュー")
                        }
                        DropdownMenu(
                            expanded = menuOpen,
                            onDismissRequest = { menuOpen = false },
                        ) {
                            DropdownMenuItem(
                                text = { Text("通報する") },
                                onClick = {
                                    menuOpen = false
                                    showReportDialog = true
                                },
                            )
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color.White,
                    titleContentColor = TextDark,
                    navigationIconContentColor = TextDark,
                    actionIconContentColor = TextDark,
                ),
            )
        },
        bottomBar = {
            state.job?.let { job ->
                if (job.hasApplied) {
                    Button(
                        onClick = {},
                        enabled = false,
                        colors = ButtonDefaults.buttonColors(disabledContainerColor = Color(0xFFCCCCCC)),
                        modifier = Modifier.fillMaxWidth().padding(16.dp),
                    ) { Text("応募済み") }
                } else {
                    Button(
                        onClick = { onApplyClick(job.id) },
                        colors = ButtonDefaults.buttonColors(containerColor = PrimaryBlue),
                        modifier = Modifier.fillMaxWidth().padding(16.dp),
                    ) {
                        Text("応募する", fontWeight = FontWeight.Bold, color = Color.White)
                    }
                }
            }
        },
        containerColor = PageBg,
    ) { padding ->
        Box(modifier = Modifier.fillMaxSize().padding(padding)) {
            when {
                state.isLoading -> CircularProgressIndicator(modifier = Modifier.align(Alignment.Center))
                state.error != null -> Text(
                    state.error!!,
                    color = MaterialTheme.colorScheme.error,
                    modifier = Modifier.align(Alignment.Center).padding(24.dp),
                )
                state.job != null -> JobDetailContent(state.job!!)
            }
        }
    }

    if (showReportDialog) {
        ReportDialog(
            title = "求人を通報",
            onDismiss = { showReportDialog = false },
            onSubmit = { reason, detail ->
                showReportDialog = false
                viewModel.report(reason, detail)
                showReportedSnack = true
            },
        )
    }
    if (showReportedSnack) {
        AlertDialog(
            onDismissRequest = { showReportedSnack = false },
            title = { Text("通報を受け付けました") },
            text = { Text("ご報告ありがとうございました。運営にて確認いたします。") },
            confirmButton = {
                TextButton(onClick = { showReportedSnack = false }) { Text("OK") }
            },
        )
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun JobDetailContent(job: JobDetail) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(bottom = 12.dp),
    ) {
        // メイン画像 (Web の aspect-[1.85/1] 相当)
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .aspectRatio(1.85f)
                .background(Color(0xFFE8E8E8)),
        ) {
            job.imageUrl?.let { url ->
                AsyncImage(
                    model = url,
                    contentDescription = job.title,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize(),
                )
            }
        }

        // タイトルカード (Web の "Top card" 相当)
        Card(
            modifier = Modifier.fillMaxWidth().padding(12.dp),
        ) {
            Column(modifier = Modifier.padding(20.dp)) {
                Text(
                    job.companyName.orEmpty(),
                    fontSize = 13.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = TextMuted,
                )
                Spacer(Modifier.height(8.dp))
                Text(
                    job.title,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    lineHeight = 30.sp,
                    color = TextDark,
                )
                if (job.tags.isNotEmpty()) {
                    Spacer(Modifier.height(12.dp))
                    FlowRow(
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        verticalArrangement = Arrangement.spacedBy(4.dp),
                    ) {
                        job.tags.take(5).forEach { tag ->
                            Box(
                                modifier = Modifier
                                    .background(PrimaryBlueLight, RoundedCornerShape(50))
                                    .padding(horizontal = 10.dp, vertical = 4.dp),
                            ) {
                                Text(tag, fontSize = 12.sp, color = PrimaryBlue)
                            }
                        }
                    }
                }
            }
        }

        // 募集要項セクション
        Section(title = "募集要項") {
            InfoRow(label = "雇用形態", value = employmentLabel(job.employmentType ?: ""))
            job.categoryTag?.let { InfoRow(label = "カテゴリ", value = it) }
            InfoRow(label = "勤務地", value = listOfNotNull(job.region, job.location, job.officeDetail).joinToString(" "))
            InfoRow(label = "給与", value = formatSalary(job))
            job.salaryNote?.let { InfoRow(label = "給与備考", value = it) }
            job.workingHours?.let { InfoRow(label = "勤務時間", value = it) }
            job.holidayType?.let { InfoRow(label = "休日休暇", value = it) }
            job.annualHolidayCount?.let {
                if (it > 0) InfoRow(label = "年間休日", value = "${it}日")
            }
        }

        // 仕事内容
        job.description?.let { SectionParagraph(title = "仕事内容", body = it) }
        job.requirements?.let { SectionParagraph(title = "応募条件", body = it) }
        job.recommendedFor?.let { SectionParagraph(title = "こんな方におすすめ", body = it) }

        // 福利厚生
        if (job.benefits.isNotEmpty()) {
            SectionParagraph(title = "福利厚生", body = job.benefits.joinToString("\n") { "・$it" })
        }
        job.benefitNote?.let { SectionParagraph(title = "福利厚生 備考", body = it) }

        // 選考フロー
        job.selectionProcess?.let { SectionParagraph(title = "選考フロー", body = it) }

        Spacer(Modifier.height(80.dp)) // 下の応募ボタン分の余白
    }
}

@Composable
private fun Card(modifier: Modifier = Modifier, content: @Composable () -> Unit) {
    Box(
        modifier = modifier
            .background(Color.White, RoundedCornerShape(16.dp)),
    ) {
        content()
    }
}

@Composable
private fun Section(title: String, content: @Composable () -> Unit) {
    Card(modifier = Modifier.fillMaxWidth().padding(horizontal = 12.dp, vertical = 6.dp)) {
        Column {
            // 青ヘッダー (Web の bg-[#2f6cff])
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(PrimaryBlue, RoundedCornerShape(topStart = 16.dp, topEnd = 16.dp))
                    .padding(horizontal = 20.dp, vertical = 8.dp),
            ) {
                Text(
                    title,
                    color = Color.White,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                )
            }
            Column(modifier = Modifier.padding(horizontal = 20.dp, vertical = 4.dp)) {
                content()
            }
        }
    }
}

@Composable
private fun SectionParagraph(title: String, body: String) {
    Section(title = title) {
        Text(
            body,
            fontSize = 14.sp,
            lineHeight = 24.sp,
            color = TextDark,
            modifier = Modifier.padding(vertical = 12.dp),
        )
    }
}

@Composable
private fun InfoRow(label: String, value: String) {
    if (value.isBlank()) return
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 12.dp),
    ) {
        Text(
            text = label,
            fontSize = 12.sp,
            fontWeight = FontWeight.SemiBold,
            color = TextMuted,
            modifier = Modifier.width(96.dp),
        )
        Text(
            text = value,
            fontSize = 14.sp,
            color = TextDark,
            lineHeight = 22.sp,
            modifier = Modifier.weight(1f),
        )
    }
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(1.dp)
            .background(BorderLight),
    )
}

private fun employmentLabel(code: String): String = when (code) {
    "FULL_TIME", "REGULAR" -> "正社員"
    "CONTRACT" -> "契約社員"
    "TEMPORARY" -> "派遣社員"
    "OUTSOURCING" -> "業務委託"
    "PART_TIME" -> "アルバイト・パート"
    "INTERN" -> "インターン"
    else -> "その他"
}

private fun formatSalary(job: JobDetail): String {
    val typeLabel = when (job.salaryType) {
        "annual" -> "年俸"
        "monthly" -> "月給"
        "daily" -> "日給"
        "hourly" -> "時給"
        else -> ""
    }
    val min = job.salaryMin?.let { "${it / 10000}万" }
    val max = job.salaryMax?.let { "${it / 10000}万" }
    val range = when {
        min != null && max != null -> "$min 〜 $max 円"
        min != null -> "$min 円〜"
        max != null -> "〜 $max 円"
        else -> ""
    }
    return listOf(typeLabel, range).filter { it.isNotEmpty() }.joinToString(" ")
}
