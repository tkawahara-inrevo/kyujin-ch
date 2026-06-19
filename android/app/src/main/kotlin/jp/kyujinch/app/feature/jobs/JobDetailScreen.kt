package jp.kyujinch.app.feature.jobs

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.FavoriteBorder
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import coil.compose.AsyncImage
import jp.kyujinch.app.core.network.JobDetail

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun JobDetailScreen(
    onBack: () -> Unit,
    viewModel: JobDetailViewModel = hiltViewModel(),
) {
    val state by viewModel.ui.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("求人詳細", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "戻る")
                    }
                },
                actions = {
                    state.job?.let { job ->
                        IconButton(onClick = viewModel::toggleFavorite) {
                            Icon(
                                imageVector = if (job.isFavorite) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
                                contentDescription = "お気に入り",
                                tint = if (job.isFavorite) MaterialTheme.colorScheme.secondary else MaterialTheme.colorScheme.onPrimary,
                            )
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    titleContentColor = MaterialTheme.colorScheme.onPrimary,
                    navigationIconContentColor = MaterialTheme.colorScheme.onPrimary,
                    actionIconContentColor = MaterialTheme.colorScheme.onPrimary,
                ),
            )
        },
    ) { padding ->
        Box(modifier = Modifier.fillMaxSize().padding(padding)) {
            when {
                state.isLoading -> CircularProgressIndicator(modifier = Modifier.align(Alignment.Center))
                state.error != null -> Text(state.error!!, color = MaterialTheme.colorScheme.error, modifier = Modifier.align(Alignment.Center).padding(24.dp))
                state.job != null -> JobDetailContent(state.job!!)
            }
        }
    }
}

@Composable
private fun JobDetailContent(job: JobDetail) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState()),
    ) {
        job.imageUrl?.let { url ->
            AsyncImage(
                model = url,
                contentDescription = job.title,
                contentScale = ContentScale.Crop,
                modifier = Modifier.fillMaxWidth().height(200.dp),
            )
        }
        Column(modifier = Modifier.padding(20.dp)) {
            Text(job.title, fontSize = 20.sp, fontWeight = FontWeight.Bold, lineHeight = 28.sp)
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                job.companyName,
                fontSize = 14.sp,
                color = MaterialTheme.colorScheme.primary,
                fontWeight = FontWeight.SemiBold,
            )
            Spacer(modifier = Modifier.height(16.dp))

            InfoCard(label = "勤務地", value = listOfNotNull(job.region, job.location, job.officeDetail).joinToString(" "))
            InfoCard(label = "雇用形態", value = employmentLabel(job.employmentType))
            InfoCard(label = "給与", value = formatSalary(job))
            job.categoryTag?.let { InfoCard(label = "カテゴリ", value = it) }

            if (job.tags.isNotEmpty()) {
                Spacer(modifier = Modifier.height(8.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    job.tags.take(5).forEach { tag ->
                        Box(
                            modifier = Modifier
                                .background(
                                    color = MaterialTheme.colorScheme.primaryContainer,
                                    shape = RoundedCornerShape(50),
                                )
                                .padding(horizontal = 10.dp, vertical = 4.dp),
                        ) {
                            Text(tag, fontSize = 12.sp, color = MaterialTheme.colorScheme.primary)
                        }
                    }
                }
            }

            job.description?.let { SectionBody(title = "仕事内容", body = it) }
            job.requirements?.let { SectionBody(title = "応募条件", body = it) }
            job.recommendedFor?.let { SectionBody(title = "こんな方におすすめ", body = it) }
            job.workingHours?.let { SectionBody(title = "勤務時間", body = it) }
            job.holidayPolicy?.let { SectionBody(title = "休日・休暇", body = it) }
            if (job.benefits.isNotEmpty()) {
                SectionBody(title = "福利厚生", body = job.benefits.joinToString("\n") { "・$it" })
            }
            job.benefitNote?.let { SectionBody(title = "福利厚生 備考", body = it) }
            job.selectionProcess?.let { SectionBody(title = "選考フロー", body = it) }
        }
    }
}

@Composable
private fun InfoCard(label: String, value: String) {
    if (value.isBlank()) return
    Row(modifier = Modifier.fillMaxWidth().padding(vertical = 6.dp)) {
        Text(
            text = label,
            fontSize = 13.sp,
            fontWeight = FontWeight.SemiBold,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.width(80.dp),
        )
        Text(text = value, fontSize = 14.sp)
    }
}

@Composable
private fun SectionBody(title: String, body: String) {
    Spacer(modifier = Modifier.height(20.dp))
    Text(title, fontSize = 16.sp, fontWeight = FontWeight.Bold)
    Spacer(modifier = Modifier.height(6.dp))
    Text(body, fontSize = 14.sp, lineHeight = 22.sp)
}

private fun employmentLabel(code: String): String = when (code) {
    "REGULAR" -> "正社員"
    "CONTRACT" -> "契約社員"
    "TEMPORARY" -> "派遣社員"
    "OUTSOURCING" -> "業務委託"
    "PART_TIME" -> "アルバイト・パート"
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
