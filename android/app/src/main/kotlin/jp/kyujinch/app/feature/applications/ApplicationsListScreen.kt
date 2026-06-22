package jp.kyujinch.app.feature.applications

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import jp.kyujinch.app.core.network.Application
import jp.kyujinch.app.core.ui.ErrorView
import jp.kyujinch.app.core.ui.PullRefresh

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ApplicationsListScreen(
    onJobClick: (String) -> Unit,
    viewModel: ApplicationsListViewModel = hiltViewModel(),
) {
    val state by viewModel.ui.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("応募", fontWeight = FontWeight.Bold) },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = androidx.compose.ui.graphics.Color.White,
                    titleContentColor = androidx.compose.ui.graphics.Color(0xFF1F2937),
                ),
            )
        },
    ) { padding ->
        PullRefresh(
            isRefreshing = state.isLoading && state.applications.isNotEmpty(),
            onRefresh = viewModel::load,
            modifier = Modifier.padding(padding),
        ) {
            when {
                state.isLoading && state.applications.isEmpty() -> CircularProgressIndicator(Modifier.align(Alignment.Center))
                state.error != null -> ErrorView(
                    message = state.error!!,
                    onRetry = viewModel::load,
                )
                state.applications.isEmpty() -> Text(
                    "まだ応募がありません",
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.align(Alignment.Center),
                )
                else -> LazyColumn(
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    items(state.applications, key = { it.id }) { app ->
                        ApplicationCard(app, onClick = { onJobClick(app.jobId) })
                    }
                }
            }
        }
    }
}

@Composable
private fun ApplicationCard(app: Application, onClick: () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth().clickable(onClick = onClick),
        shape = RoundedCornerShape(12.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                StatusBadge(status = app.status)
                Spacer(Modifier.height(0.dp))
            }
            Spacer(Modifier.height(8.dp))
            Text(app.job.title, fontWeight = FontWeight.Bold, fontSize = 15.sp, maxLines = 2)
            Spacer(Modifier.height(4.dp))
            Text(
                app.job.companyName,
                fontSize = 12.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Spacer(Modifier.height(4.dp))
            Text(
                "応募日: ${app.createdAt.take(10)}",
                fontSize = 11.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
    }
}

@Composable
private fun StatusBadge(status: String) {
    val (label, bg, fg) = when (status) {
        "PENDING" -> Triple("未読", Color(0xFFFFF3CD), Color(0xFF92670A))
        "VIEWED" -> Triple("既読", Color(0xFFE0E7FF), Color(0xFF4338CA))
        "PASSED" -> Triple("通過", Color(0xFFD1FAE5), Color(0xFF065F46))
        "REJECTED" -> Triple("不採用", Color(0xFFFEE2E2), Color(0xFFB91C1C))
        else -> Triple(status, Color(0xFFEEEEEE), Color(0xFF555555))
    }
    Box(
        modifier = Modifier
            .background(color = bg, shape = RoundedCornerShape(50))
            .padding(horizontal = 10.dp, vertical = 4.dp),
    ) {
        Text(label, fontSize = 11.sp, color = fg, fontWeight = FontWeight.SemiBold)
    }
}

