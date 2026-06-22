package jp.kyujinch.app.feature.swipe

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import coil.compose.AsyncImage
import jp.kyujinch.app.core.network.JobDetail
import jp.kyujinch.app.core.ui.ErrorView
import kotlinx.coroutines.launch
import kotlin.math.roundToInt

private val PageBg = Color(0xFFF7F7F7)
private val TextDark = Color(0xFF1F2937)
private val TextMuted = Color(0xFF6B7280)
private val PrimaryBlue = Color(0xFF2F6CFF)
private val SecondaryRed = Color(0xFFFF3158)
private val AcceptGreen = Color(0xFF16A34A)
private val RejectGray = Color(0xFF9CA3AF)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SwipeScreen(
    onBack: () -> Unit,
    onEditProfile: () -> Unit,
    viewModel: SwipeViewModel = hiltViewModel(),
) {
    val state by viewModel.ui.collectAsState()
    var detailJob by remember { mutableStateOf<JobDetail?>(null) }
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        "本日のおすすめ求人",
                        fontWeight = FontWeight.Bold,
                        color = TextDark,
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "戻る", tint = TextDark)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.White),
            )
        },
        containerColor = PageBg,
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 12.dp),
        ) {
            when {
                state.isLoading -> CircularProgressIndicator(Modifier.align(Alignment.Center))
                state.error != null -> ErrorView(state.error!!, onRetry = viewModel::load)
                state.cards.isEmpty() -> EmptyState(onReload = viewModel::load)
                else -> {
                    CardStack(
                        cards = state.cards,
                        onReject = viewModel::reject,
                        onApply = viewModel::apply,
                        onLongPress = { job -> detailJob = job },
                    )
                    if (state.isApplying) {
                        CircularProgressIndicator(Modifier.align(Alignment.Center))
                    }
                }
            }
        }
    }

    detailJob?.let { job ->
        ModalBottomSheet(
            onDismissRequest = { detailJob = null },
            sheetState = sheetState,
        ) {
            JobDetailSheet(job)
        }
    }

    if (state.profileIncomplete) {
        AlertDialog(
            onDismissRequest = viewModel::dismissProfileIncomplete,
            title = { Text("プロフィール未完了") },
            text = {
                Text("応募には以下の情報が必要です: ${state.missingFields.joinToString("、")}")
            },
            confirmButton = {
                TextButton(onClick = {
                    viewModel.dismissProfileIncomplete()
                    onEditProfile()
                }) { Text("プロフィールを編集") }
            },
            dismissButton = {
                TextButton(onClick = viewModel::dismissProfileIncomplete) {
                    Text("キャンセル")
                }
            },
        )
    }
}

@Composable
private fun CardStack(
    cards: List<JobDetail>,
    onReject: (String) -> Unit,
    onApply: (String) -> Unit,
    onLongPress: (JobDetail) -> Unit,
) {
    Column(modifier = Modifier.fillMaxSize()) {
        Box(modifier = Modifier.weight(1f).fillMaxWidth(), contentAlignment = Alignment.Center) {
            // 後ろから順に描画 (上のカードが手前)
            cards.take(3).reversed().forEachIndexed { reversedIndex, job ->
                val depth = 2 - reversedIndex  // 0=top, 1=second, 2=third
                val isTop = depth == 0
                SwipeCard(
                    job = job,
                    isTopCard = isTop,
                    depth = depth,
                    onSwipedLeft = { onReject(job.id) },
                    onSwipedRight = { onApply(job.id) },
                    onLongPress = { onLongPress(job) },
                )
            }
        }
        ActionButtons(
            onReject = { cards.firstOrNull()?.let { onReject(it.id) } },
            onApply = { cards.firstOrNull()?.let { onApply(it.id) } },
        )
    }
}

@Composable
private fun SwipeCard(
    job: JobDetail,
    isTopCard: Boolean,
    depth: Int,
    onSwipedLeft: () -> Unit,
    onSwipedRight: () -> Unit,
    onLongPress: () -> Unit,
) {
    val offsetX = remember { Animatable(0f) }
    val offsetY = remember { Animatable(0f) }
    val scope = rememberCoroutineScope()
    val density = LocalDensity.current
    val swipeThresholdPx = with(density) { 120.dp.toPx() }

    val scaleByDepth = 1f - depth * 0.04f
    val yOffsetByDepth = with(density) { (depth * 8).dp.toPx() }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .offset {
                IntOffset(
                    x = offsetX.value.roundToInt(),
                    y = (offsetY.value + yOffsetByDepth).roundToInt(),
                )
            }
            .graphicsLayer {
                rotationZ = if (isTopCard) offsetX.value / 30f else 0f
                scaleX = scaleByDepth
                scaleY = scaleByDepth
            }
            .padding(vertical = 8.dp),
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .clip(RoundedCornerShape(20.dp))
                .background(Color.White)
                .then(
                    if (isTopCard) Modifier.pointerInput(job.id) {
                        detectDragGestures(
                            onDragEnd = {
                                scope.launch {
                                    when {
                                        offsetX.value > swipeThresholdPx -> {
                                            offsetX.animateTo(1500f, tween(300))
                                            onSwipedRight()
                                        }
                                        offsetX.value < -swipeThresholdPx -> {
                                            offsetX.animateTo(-1500f, tween(300))
                                            onSwipedLeft()
                                        }
                                        else -> {
                                            offsetX.animateTo(0f, tween(200))
                                            offsetY.animateTo(0f, tween(200))
                                        }
                                    }
                                }
                            },
                            onDrag = { change, drag ->
                                change.consume()
                                scope.launch {
                                    offsetX.snapTo(offsetX.value + drag.x)
                                    offsetY.snapTo(offsetY.value + drag.y)
                                }
                            },
                        )
                    } else Modifier,
                )
                .then(
                    if (isTopCard) Modifier.pointerInput(job.id) {
                        detectTapGestures(onLongPress = { onLongPress() })
                    } else Modifier,
                ),
        ) {
            CardBody(job)
            // YES/NO オーバーレイ (上カードのみ)
            if (isTopCard) {
                val alphaRight = (offsetX.value / swipeThresholdPx).coerceIn(0f, 1f)
                val alphaLeft = (-offsetX.value / swipeThresholdPx).coerceIn(0f, 1f)
                if (alphaRight > 0f) {
                    Box(
                        modifier = Modifier
                            .align(Alignment.TopStart)
                            .padding(20.dp)
                            .graphicsLayer { alpha = alphaRight }
                            .borderTag(AcceptGreen)
                            .padding(horizontal = 12.dp, vertical = 4.dp),
                    ) {
                        Text("応募", color = AcceptGreen, fontWeight = FontWeight.Bold, fontSize = 18.sp)
                    }
                }
                if (alphaLeft > 0f) {
                    Box(
                        modifier = Modifier
                            .align(Alignment.TopEnd)
                            .padding(20.dp)
                            .graphicsLayer { alpha = alphaLeft }
                            .borderTag(RejectGray)
                            .padding(horizontal = 12.dp, vertical = 4.dp),
                    ) {
                        Text("スキップ", color = RejectGray, fontWeight = FontWeight.Bold, fontSize = 18.sp)
                    }
                }
            }
        }
    }
}

@Composable
private fun CardBody(job: JobDetail) {
    Column(modifier = Modifier.fillMaxSize()) {
        // 画像
        Box(modifier = Modifier.fillMaxWidth().aspectRatio(1.4f).background(Color(0xFFE8E8E8))) {
            job.imageUrl?.let { url ->
                AsyncImage(
                    model = url,
                    contentDescription = job.title,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize(),
                )
            }
        }
        // 中央のタグ部分 (長押し領域)
        Column(modifier = Modifier.padding(20.dp).weight(1f)) {
            Text(
                job.companyName.orEmpty(),
                fontSize = 12.sp,
                fontWeight = FontWeight.SemiBold,
                color = TextMuted,
            )
            Spacer(Modifier.height(6.dp))
            Text(
                job.title,
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = TextDark,
                lineHeight = 26.sp,
                maxLines = 2,
            )
            Spacer(Modifier.height(12.dp))
            TagGrid(job)
            Spacer(Modifier.height(12.dp))
            Text(
                "💡 長押しで詳細",
                fontSize = 11.sp,
                color = TextMuted,
                modifier = Modifier.align(Alignment.CenterHorizontally),
            )
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun TagGrid(job: JobDetail) {
    val tags = buildList {
        job.categoryTag?.let { add("カテゴリ: $it") }
        job.employmentType?.let { add("雇用形態: ${employmentLabel(it)}") }
        listOfNotNull(job.region, job.location).takeIf { it.isNotEmpty() }?.let {
            add("勤務地: ${it.joinToString(" ")}")
        }
        formatSalary(job).takeIf { it.isNotEmpty() }?.let { add("給与: $it") }
        job.holidayType?.let { add("休み: $it") }
        job.annualHolidayCount?.takeIf { it > 0 }?.let { add("年間休日: ${it}日") }
        job.workingHours?.let { add("勤務時間: $it") }
        job.selectionProcess?.let { add("選考: ${it.lines().firstOrNull() ?: it}") }
    }
    FlowRow(
        horizontalArrangement = Arrangement.spacedBy(6.dp),
        verticalArrangement = Arrangement.spacedBy(6.dp),
    ) {
        tags.forEach { tag ->
            Box(
                modifier = Modifier
                    .background(Color(0xFFEFEFEF), RoundedCornerShape(50))
                    .padding(horizontal = 10.dp, vertical = 4.dp),
            ) {
                Text(tag, fontSize = 11.sp, color = TextDark, maxLines = 1)
            }
        }
    }
}

@Composable
private fun ActionButtons(onReject: () -> Unit, onApply: () -> Unit) {
    Row(
        modifier = Modifier.fillMaxWidth().padding(vertical = 16.dp),
        horizontalArrangement = Arrangement.SpaceEvenly,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        FloatingActionButton(
            onClick = onReject,
            containerColor = Color.White,
            contentColor = RejectGray,
        ) {
            Icon(Icons.Default.Close, contentDescription = "スキップ", modifier = Modifier.size(28.dp))
        }
        FloatingActionButton(
            onClick = onApply,
            containerColor = AcceptGreen,
            contentColor = Color.White,
        ) {
            Icon(Icons.Default.Check, contentDescription = "応募", modifier = Modifier.size(28.dp))
        }
    }
}

@Composable
private fun JobDetailSheet(job: JobDetail) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .verticalScroll(rememberScrollState())
            .padding(20.dp),
    ) {
        Text(
            job.companyName.orEmpty(),
            fontSize = 12.sp,
            color = TextMuted,
            fontWeight = FontWeight.SemiBold,
        )
        Spacer(Modifier.height(4.dp))
        Text(
            job.title,
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold,
            color = TextDark,
        )
        Spacer(Modifier.height(16.dp))
        job.description?.let { SheetSection("仕事内容", it) }
        job.requirements?.let { SheetSection("応募条件", it) }
        job.workingHours?.let { SheetSection("勤務時間", it) }
        job.holidayPolicy?.let { SheetSection("休日休暇", it) }
        job.selectionProcess?.let { SheetSection("選考フロー", it) }
        Spacer(Modifier.height(16.dp))
    }
}

@Composable
private fun SheetSection(title: String, body: String) {
    Spacer(Modifier.height(12.dp))
    Text(title, fontSize = 14.sp, fontWeight = FontWeight.Bold, color = PrimaryBlue)
    Spacer(Modifier.height(4.dp))
    Text(body, fontSize = 13.sp, color = TextDark, lineHeight = 20.sp)
}

@Composable
private fun EmptyState(onReload: () -> Unit) {
    Column(
        modifier = Modifier.fillMaxSize(),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Text("おすすめの求人を確認しました 🎉", fontSize = 16.sp, color = TextDark)
        Spacer(Modifier.height(8.dp))
        Text(
            "また明日チェックしてください",
            fontSize = 13.sp,
            color = TextMuted,
        )
        Spacer(Modifier.height(20.dp))
        TextButton(onClick = onReload) {
            Text("再読み込み", color = PrimaryBlue)
        }
    }
}

private fun Modifier.borderTag(color: Color): Modifier =
    this.then(
        androidx.compose.foundation.border(
            width = 3.dp,
            color = color,
            shape = RoundedCornerShape(8.dp),
        ),
    )

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
    val min = job.salaryMin?.let { "${it / 10000}万" }
    val max = job.salaryMax?.let { "${it / 10000}万" }
    return when {
        min != null && max != null -> "$min 〜 $max 円"
        min != null -> "$min 円〜"
        max != null -> "〜 $max 円"
        else -> ""
    }
}
