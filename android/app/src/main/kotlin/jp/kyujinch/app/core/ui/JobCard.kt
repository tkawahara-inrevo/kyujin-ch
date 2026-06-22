package jp.kyujinch.app.core.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.FavoriteBorder
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import jp.kyujinch.app.core.network.JobSummary

/**
 * Web の components/job-card.tsx と揃えた求人カード。
 * - 角丸 10dp、白背景、薄い影
 * - 画像 アスペクト比 1.85:1
 * - バッジ (注目/新着 等) 画像右上、bg #ff3158 白文字
 * - タグ群: カテゴリ (黒地白文字) + 他タグ (薄グレー)
 * - タイトル + ハートアイコン
 * - 会社名・勤務地・給与
 */
@OptIn(ExperimentalLayoutApi::class)
@Composable
fun JobCard(
    job: JobSummary,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    onFavoriteClick: (() -> Unit)? = null,
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(10.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
    ) {
        // 画像エリア
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .aspectRatio(1.85f)
                .background(Color(0xFFE8E8E8)),
        ) {
            if (job.imageUrl != null) {
                AsyncImage(
                    model = job.imageUrl,
                    contentDescription = job.title,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize(),
                )
            }
            // バッジ (画像右上)
            val badge = badgeFor(job)
            if (badge != null) {
                Box(
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .padding(12.dp)
                        .background(Color(0xFFFF3158), RoundedCornerShape(4.dp))
                        .padding(horizontal = 8.dp, vertical = 3.dp),
                ) {
                    Text(
                        text = badge,
                        color = Color.White,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                    )
                }
            }
        }

        Column(modifier = Modifier.padding(horizontal = 12.dp, vertical = 12.dp)) {
            // タグ群
            val tags = mutableListOf<TagSpec>()
            job.tags.take(3).forEachIndexed { index, t ->
                if (index == 0) {
                    tags.add(TagSpec(label = t, isCategory = true))
                } else {
                    tags.add(TagSpec(label = t, isCategory = false))
                }
            }
            if (tags.isNotEmpty()) {
                FlowRow(
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    verticalArrangement = Arrangement.spacedBy(4.dp),
                ) {
                    tags.forEach { spec ->
                        Tag(spec)
                    }
                }
                Spacer(Modifier.height(10.dp))
            }

            // タイトル + ハートアイコン
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.Top,
            ) {
                Text(
                    text = job.title,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    lineHeight = 22.sp,
                    color = Color(0xFF222222),
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.weight(1f),
                )
                if (onFavoriteClick != null) {
                    IconButton(
                        onClick = onFavoriteClick,
                        modifier = Modifier.size(28.dp),
                    ) {
                        Icon(
                            imageVector = if (job.isFavorite) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
                            contentDescription = "お気に入り",
                            tint = if (job.isFavorite) Color(0xFFFF3158) else Color(0xFFBBBBBB),
                            modifier = Modifier.size(22.dp),
                        )
                    }
                }
            }

            // 会社名
            Spacer(Modifier.height(6.dp))
            Text(
                text = job.companyName,
                fontSize = 13.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color(0xFF555555),
            )

            // 勤務地
            if (job.location != null) {
                Spacer(Modifier.height(10.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        Icons.Default.LocationOn,
                        contentDescription = null,
                        tint = Color(0xFF666666),
                        modifier = Modifier.size(13.dp),
                    )
                    Spacer(Modifier.size(6.dp))
                    Text(
                        text = job.location,
                        fontSize = 12.sp,
                        color = Color(0xFF666666),
                    )
                }
            }

            // 給与
            val salary = formatSalary(job)
            if (salary.isNotEmpty()) {
                Spacer(Modifier.height(6.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        "¥",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color(0xFF666666),
                    )
                    Spacer(Modifier.size(6.dp))
                    Text(
                        text = salary,
                        fontSize = 12.sp,
                        color = Color(0xFF666666),
                    )
                }
            }

            // 掲載日
            job.publishedAt?.let { iso ->
                Spacer(Modifier.height(10.dp))
                Text(
                    text = "掲載日 ${iso.take(10).replace("-", "/")}",
                    fontSize = 11.sp,
                    color = Color(0xFFAAAAAA),
                    modifier = Modifier.align(Alignment.End),
                )
            }
        }
    }
}

private data class TagSpec(val label: String, val isCategory: Boolean)

@Composable
private fun Tag(spec: TagSpec) {
    val bg = if (spec.isCategory) Color(0xFF4B4B4B) else Color(0xFFEFEFEF)
    val fg = if (spec.isCategory) Color.White else Color(0xFF555555)
    Box(
        modifier = Modifier
            .background(bg, RoundedCornerShape(50))
            .padding(horizontal = 10.dp, vertical = 3.dp),
    ) {
        Text(
            spec.label,
            color = fg,
            fontSize = 10.sp,
            fontWeight = FontWeight.Bold,
        )
    }
}

private fun badgeFor(job: JobSummary): String? {
    // Web では isPublished からの推測ロジック。Mobile では targetType ベース。
    return when (job.targetType) {
        "NEW_GRAD" -> "新卒"
        "PART_TIME_INTERN" -> "アルバイト"
        "MID_CAREER" -> "中途"
        else -> null
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
