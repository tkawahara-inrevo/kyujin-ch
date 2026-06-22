package jp.kyujinch.app.feature.home

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import coil.compose.AsyncImage
import jp.kyujinch.app.core.network.JobSummary
import jp.kyujinch.app.core.ui.ErrorView
import jp.kyujinch.app.core.ui.JobCard
import jp.kyujinch.app.core.ui.PullRefresh

private val PageBg = Color(0xFFF7F7F7)
private val BrandBlue = Color(0xFF2F6CFF)
private val BrandRed = Color(0xFFFF5A78)
private val TextDark = Color(0xFF1F2937)
private val TextMuted = Color(0xFF6B7280)

/** Web 側 components/top-fv-section.tsx の CATEGORY_META と一致 */
private data class CategorySpec(val key: String, val label: String, val iconUrl: String)

private val CATEGORIES = listOf(
    CategorySpec("アルバイト・インターン", "アルバイト\nインターン", "https://kyujin-ch.jp/assets/Resume.png"),
    CategorySpec("営業", "営業", "https://kyujin-ch.jp/assets/Bag.png"),
    CategorySpec("企画/マーケティング", "企画\nマーケ", "https://kyujin-ch.jp/assets/Graph.png"),
    CategorySpec("事務・管理・バックオフィス", "事務\n管理", "https://kyujin-ch.jp/assets/List.png"),
    CategorySpec("販売・サービス・飲食", "販売\nサービス", "https://kyujin-ch.jp/assets/Talk_01.png"),
    CategorySpec("IT/エンジニア", "IT\nエンジニア", "https://kyujin-ch.jp/assets/Engineer.png"),
    CategorySpec("クリエイター", "クリエイター", "https://kyujin-ch.jp/assets/Design.png"),
    CategorySpec("不動産", "不動産", "https://kyujin-ch.jp/assets/Realty.png"),
    CategorySpec("建築・土木・設備", "建築\n土木", "https://kyujin-ch.jp/assets/Construction.png"),
    CategorySpec("機械/電気/電子製品", "機械\n電気", "https://kyujin-ch.jp/assets/Engineering.png"),
    CategorySpec("交通/運輸/物流", "交通\n物流", "https://kyujin-ch.jp/assets/Logistics.png"),
    CategorySpec("医療/福祉", "医療\n福祉", "https://kyujin-ch.jp/assets/Healthcare.png"),
    CategorySpec("人材サービス", "人材\nサービス", "https://kyujin-ch.jp/assets/Recruitment.png"),
    CategorySpec("専門職（コンサル・金融・公務員・インストラクター）", "専門職", "https://kyujin-ch.jp/assets/Professional.png"),
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    onJobClick: (String) -> Unit = {},
    onCategoryClick: (String) -> Unit = {},
    viewModel: HomeViewModel = hiltViewModel(),
) {
    val state by viewModel.ui.collectAsState()

    Scaffold(
        containerColor = PageBg,
    ) { padding ->
        PullRefresh(
            isRefreshing = state.isLoading && (state.featured.isNotEmpty() || state.new.isNotEmpty()),
            onRefresh = viewModel::load,
            modifier = Modifier.padding(padding),
        ) {
            when {
                state.isLoading && state.featured.isEmpty() && state.new.isEmpty() -> {
                    CircularProgressIndicator(modifier = Modifier.align(Alignment.Center))
                }
                state.error != null -> {
                    ErrorView(message = state.error ?: "", onRetry = viewModel::load)
                }
                else -> {
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .verticalScroll(rememberScrollState()),
                    ) {
                        BrandHeader()
                        HeroBanner()
                        CategoryGrid(onClick = onCategoryClick)
                        Spacer(Modifier.height(20.dp))
                        if (state.featured.isNotEmpty()) {
                            SectionHeader(title = "注目の求人", color = BrandRed)
                            Column(
                                modifier = Modifier.padding(horizontal = 12.dp),
                                verticalArrangement = Arrangement.spacedBy(12.dp),
                            ) {
                                state.featured.forEach { job ->
                                    JobCard(job, onClick = { onJobClick(job.id) })
                                }
                            }
                            Spacer(Modifier.height(20.dp))
                        }
                        if (state.new.isNotEmpty()) {
                            SectionHeader(title = "新着求人", color = BrandBlue)
                            Column(
                                modifier = Modifier.padding(horizontal = 12.dp),
                                verticalArrangement = Arrangement.spacedBy(12.dp),
                            ) {
                                state.new.forEach { job ->
                                    JobCard(job, onClick = { onJobClick(job.id) })
                                }
                            }
                            Spacer(Modifier.height(20.dp))
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun BrandHeader() {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color.White)
            .padding(horizontal = 16.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(
            text = "求人ちゃんねる",
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold,
            color = BrandBlue,
        )
        Spacer(Modifier.size(8.dp))
        Box(
            modifier = Modifier
                .background(BrandBlue, RoundedCornerShape(50))
                .padding(horizontal = 12.dp, vertical = 4.dp),
        ) {
            Text("中途", color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
private fun HeroBanner() {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 12.dp, vertical = 8.dp)
            .clip(RoundedCornerShape(16.dp))
            .aspectRatio(2f),
    ) {
        AsyncImage(
            model = "https://kyujin-ch.jp/assets/top_fv.png",
            contentDescription = "求人ちゃんねる",
            contentScale = ContentScale.Crop,
            modifier = Modifier.fillMaxSize().background(Color(0xFFE8E8E8)),
        )
    }
}

@Composable
private fun CategoryGrid(onClick: (String) -> Unit) {
    Column(
        modifier = Modifier.fillMaxWidth().padding(horizontal = 12.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        CATEGORIES.chunked(4).forEach { row ->
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                row.forEach { c ->
                    CategoryCell(
                        spec = c,
                        modifier = Modifier.weight(1f),
                        onClick = { onClick(c.key) },
                    )
                }
                repeat(4 - row.size) {
                    Box(modifier = Modifier.weight(1f))
                }
            }
        }
    }
}

@Composable
private fun CategoryCell(spec: CategorySpec, modifier: Modifier = Modifier, onClick: () -> Unit) {
    Column(
        modifier = modifier
            .clickable(onClick = onClick)
            .padding(vertical = 4.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Box(
            modifier = Modifier
                .size(72.dp)
                .clip(CircleShape)
                .background(Color.White),
            contentAlignment = Alignment.Center,
        ) {
            AsyncImage(
                model = spec.iconUrl,
                contentDescription = spec.label,
                contentScale = ContentScale.Fit,
                modifier = Modifier.size(56.dp),
            )
        }
        Spacer(Modifier.height(6.dp))
        Text(
            text = spec.label,
            fontSize = 11.sp,
            fontWeight = FontWeight.SemiBold,
            color = TextDark,
            textAlign = androidx.compose.ui.text.style.TextAlign.Center,
            lineHeight = 14.sp,
        )
    }
}

@Composable
private fun SectionHeader(title: String, color: Color) {
    Row(
        modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 10.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(
            modifier = Modifier
                .size(width = 4.dp, height = 18.dp)
                .background(color, RoundedCornerShape(2.dp)),
        )
        Spacer(Modifier.size(8.dp))
        Text(title, fontSize = 16.sp, fontWeight = FontWeight.Bold, color = TextDark)
    }
}
