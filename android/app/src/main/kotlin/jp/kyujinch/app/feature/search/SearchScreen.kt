package jp.kyujinch.app.feature.search

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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.FilterList
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.material3.rememberModalBottomSheetState
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
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import coil.compose.AsyncImage
import jp.kyujinch.app.core.network.JobSummary

private val PREFECTURES = listOf(
    "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
    "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
    "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県",
    "岐阜県", "静岡県", "愛知県", "三重県",
    "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県",
    "鳥取県", "島根県", "岡山県", "広島県", "山口県",
    "徳島県", "香川県", "愛媛県", "高知県",
    "福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県",
)

private val CATEGORIES = listOf(
    "営業", "事務", "エンジニア", "クリエイティブ", "販売", "サービス",
    "製造", "建築", "物流", "医療・福祉", "教育", "その他",
)

private val EMPLOYMENT_TYPES = listOf(
    "FULL_TIME" to "正社員",
    "CONTRACT" to "契約社員",
    "TEMPORARY" to "派遣",
    "PART_TIME" to "アルバイト",
    "OUTSOURCING" to "業務委託",
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SearchScreen(
    onJobClick: (String) -> Unit,
    viewModel: SearchViewModel = hiltViewModel(),
) {
    val state by viewModel.ui.collectAsState()
    var showFilters by remember { mutableStateOf(false) }
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("検索", fontWeight = FontWeight.Bold) },
                actions = {
                    IconButton(onClick = { showFilters = true }) {
                        Icon(
                            Icons.Default.FilterList,
                            contentDescription = "絞り込み",
                            tint = MaterialTheme.colorScheme.onPrimary,
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    titleContentColor = MaterialTheme.colorScheme.onPrimary,
                ),
            )
        },
    ) { padding ->
        Column(
            modifier = Modifier.fillMaxSize().padding(padding),
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 12.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                OutlinedTextField(
                    value = state.query,
                    onValueChange = viewModel::setQuery,
                    placeholder = { Text("職種・社名・キーワード") },
                    leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
                    modifier = Modifier.weight(1f),
                )
                Button(
                    onClick = viewModel::search,
                    enabled = !state.isLoading,
                ) {
                    Text("検索")
                }
            }

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 4.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text("並び替え:", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                listOf("new" to "新着", "pv" to "人気", "recommend" to "おすすめ").forEach { (k, label) ->
                    FilterChip(
                        selected = state.sort == k,
                        onClick = {
                            viewModel.setSort(k)
                            if (state.hasSearched) viewModel.search()
                        },
                        label = { Text(label, fontSize = 12.sp) },
                    )
                }
            }

            val activeFilterCount = state.prefectures.size +
                (if (state.category != null) 1 else 0) +
                (if (state.employmentType != null) 1 else 0)
            if (activeFilterCount > 0) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Text(
                        "絞り込み中: $activeFilterCount",
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.primary,
                    )
                    TextButton(onClick = viewModel::clearFilters) {
                        Text("クリア", fontSize = 12.sp)
                    }
                }
            }

            Box(modifier = Modifier.fillMaxSize()) {
                when {
                    state.isLoading -> CircularProgressIndicator(Modifier.align(Alignment.Center))
                    state.error != null -> Text(
                        state.error!!,
                        color = MaterialTheme.colorScheme.error,
                        modifier = Modifier.align(Alignment.Center).padding(24.dp),
                    )
                    !state.hasSearched -> Text(
                        "キーワードや絞り込みで検索",
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.align(Alignment.Center),
                    )
                    state.jobs.isEmpty() -> Text(
                        "条件に合う求人がありません",
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.align(Alignment.Center),
                    )
                    else -> LazyColumn(
                        contentPadding = PaddingValues(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp),
                    ) {
                        items(state.jobs, key = { it.id }) { job ->
                            SearchJobCard(job, onClick = { onJobClick(job.id) })
                        }
                    }
                }
            }
        }
    }

    if (showFilters) {
        ModalBottomSheet(
            onDismissRequest = { showFilters = false },
            sheetState = sheetState,
        ) {
            FilterSheet(
                state = state,
                onTogglePrefecture = viewModel::togglePrefecture,
                onSetCategory = viewModel::setCategory,
                onSetEmploymentType = viewModel::setEmploymentType,
                onClear = viewModel::clearFilters,
                onApply = {
                    showFilters = false
                    viewModel.search()
                },
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun FilterSheet(
    state: SearchUiState,
    onTogglePrefecture: (String) -> Unit,
    onSetCategory: (String?) -> Unit,
    onSetEmploymentType: (String?) -> Unit,
    onClear: () -> Unit,
    onApply: () -> Unit,
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .verticalScroll(rememberScrollState())
            .padding(20.dp),
    ) {
        Text("絞り込み", fontSize = 18.sp, fontWeight = FontWeight.Bold)

        Spacer(Modifier.height(16.dp))
        SectionTitle("勤務地（都道府県）")
        FlowChips(
            items = PREFECTURES,
            selected = state.prefectures,
            onClick = onTogglePrefecture,
        )

        Spacer(Modifier.height(16.dp))
        SectionTitle("カテゴリ")
        SingleChips(
            items = CATEGORIES,
            selected = state.category,
            onClick = onSetCategory,
        )

        Spacer(Modifier.height(16.dp))
        SectionTitle("雇用形態")
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            EMPLOYMENT_TYPES.forEach { (value, label) ->
                FilterChip(
                    selected = state.employmentType == value,
                    onClick = {
                        onSetEmploymentType(if (state.employmentType == value) null else value)
                    },
                    label = { Text(label) },
                )
            }
        }

        Spacer(Modifier.height(24.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            TextButton(onClick = onClear, modifier = Modifier.weight(1f)) {
                Text("クリア")
            }
            Button(onClick = onApply, modifier = Modifier.weight(2f)) {
                Text("検索する")
            }
        }
        Spacer(Modifier.height(8.dp))
    }
}

@Composable
private fun SectionTitle(text: String) {
    Text(
        text,
        fontSize = 13.sp,
        fontWeight = FontWeight.SemiBold,
        color = MaterialTheme.colorScheme.onSurfaceVariant,
        modifier = Modifier.padding(bottom = 8.dp),
    )
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun FlowChips(
    items: List<String>,
    selected: Set<String>,
    onClick: (String) -> Unit,
) {
    androidx.compose.foundation.layout.FlowRow(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(6.dp),
        verticalArrangement = Arrangement.spacedBy(0.dp),
    ) {
        items.forEach { item ->
            FilterChip(
                selected = item in selected,
                onClick = { onClick(item) },
                label = { Text(item, fontSize = 12.sp) },
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun SingleChips(
    items: List<String>,
    selected: String?,
    onClick: (String?) -> Unit,
) {
    androidx.compose.foundation.layout.FlowRow(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(6.dp),
        verticalArrangement = Arrangement.spacedBy(0.dp),
    ) {
        items.forEach { item ->
            FilterChip(
                selected = selected == item,
                onClick = { onClick(if (selected == item) null else item) },
                label = { Text(item, fontSize = 12.sp) },
            )
        }
    }
}

@Composable
private fun SearchJobCard(job: JobSummary, onClick: () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth().clickable(onClick = onClick),
        shape = RoundedCornerShape(12.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            job.imageUrl?.let {
                AsyncImage(
                    model = it,
                    contentDescription = job.title,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxWidth().height(140.dp),
                )
                Spacer(Modifier.height(10.dp))
            }
            Text(job.title, fontWeight = FontWeight.Bold, fontSize = 15.sp, maxLines = 2)
            Spacer(Modifier.height(4.dp))
            Text(
                job.companyName,
                fontSize = 12.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            job.location?.let {
                Spacer(Modifier.height(2.dp))
                Text(it, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        }
    }
}
