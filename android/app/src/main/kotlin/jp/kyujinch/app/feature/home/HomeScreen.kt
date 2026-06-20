package jp.kyujinch.app.feature.home

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import coil.compose.AsyncImage
import jp.kyujinch.app.core.network.JobSummary
import jp.kyujinch.app.core.ui.ErrorView
import jp.kyujinch.app.core.ui.PullRefresh

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    onJobClick: (String) -> Unit = {},
    viewModel: HomeViewModel = hiltViewModel(),
) {
    val state by viewModel.ui.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("求人ちゃんねる", fontWeight = FontWeight.Bold) },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    titleContentColor = MaterialTheme.colorScheme.onPrimary,
                ),
            )
        },
    ) { padding ->
        PullRefresh(
            isRefreshing = state.isLoading && state.jobs.isNotEmpty(),
            onRefresh = viewModel::load,
            modifier = Modifier.padding(padding),
        ) {
            when {
                state.isLoading && state.jobs.isEmpty() -> {
                    CircularProgressIndicator(modifier = Modifier.align(Alignment.Center))
                }
                state.error != null -> {
                    ErrorView(
                        message = state.error ?: "",
                        onRetry = viewModel::load,
                    )
                }
                state.jobs.isEmpty() -> {
                    Text(
                        text = "求人がありません",
                        modifier = Modifier.align(Alignment.Center),
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
                else -> {
                    LazyColumn(
                        contentPadding = androidx.compose.foundation.layout.PaddingValues(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp),
                    ) {
                        items(state.jobs, key = { it.id }) { job ->
                            JobCard(job, onClick = { onJobClick(job.id) })
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun JobCard(job: JobSummary, onClick: () -> Unit = {}) {
    Card(
        modifier = Modifier.fillMaxWidth().clickable(onClick = onClick),
        shape = RoundedCornerShape(12.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            job.imageUrl?.let { url ->
                AsyncImage(
                    model = url,
                    contentDescription = job.title,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(160.dp),
                    contentScale = androidx.compose.ui.layout.ContentScale.Crop,
                )
                Spacer(modifier = Modifier.height(12.dp))
            }
            Text(
                text = job.title,
                fontWeight = FontWeight.Bold,
                fontSize = 16.sp,
                maxLines = 2,
            )
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = job.companyName,
                fontSize = 13.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            if (job.location != null) {
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = job.location,
                    fontSize = 12.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
            if (job.salaryMin != null || job.salaryMax != null) {
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = formatSalary(job),
                    fontSize = 13.sp,
                    color = MaterialTheme.colorScheme.primary,
                    fontWeight = FontWeight.SemiBold,
                )
            }
        }
    }
}

private fun formatSalary(job: JobSummary): String {
    val min = job.salaryMin?.let { "${it / 10000}万" }
    val max = job.salaryMax?.let { "${it / 10000}万" }
    return when {
        min != null && max != null -> "$min 〜 $max 円"
        min != null -> "$min 円〜"
        max != null -> "〜 $max 円"
        else -> ""
    }
}
