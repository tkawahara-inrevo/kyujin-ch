package jp.kyujinch.app.feature.resume

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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.Button
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import jp.kyujinch.app.core.network.Certification
import jp.kyujinch.app.core.network.Education
import jp.kyujinch.app.core.network.WorkExperience

private val TextDark = Color(0xFF1F2937)
private val TextMuted = Color(0xFF6B7280)
private val PageBg = Color(0xFFF7F7F7)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ResumeScreen(
    onBack: () -> Unit,
    viewModel: ResumeViewModel = hiltViewModel(),
) {
    val state by viewModel.ui.collectAsState()

    LaunchedEffect(state.saved) {
        if (state.saved) onBack()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("履歴書", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "戻る")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color.White,
                    titleContentColor = TextDark,
                    navigationIconContentColor = TextDark,
                ),
            )
        },
        bottomBar = {
            Box(modifier = Modifier.fillMaxWidth().background(Color.White).padding(16.dp)) {
                Button(
                    onClick = viewModel::save,
                    enabled = !state.isSaving,
                    modifier = Modifier.fillMaxWidth(),
                ) {
                    if (state.isSaving) {
                        CircularProgressIndicator(modifier = Modifier.height(20.dp), strokeWidth = 2.dp)
                    } else {
                        Text("保存する", fontWeight = FontWeight.Bold)
                    }
                }
            }
        },
        containerColor = PageBg,
    ) { padding ->
        Box(Modifier.fillMaxSize().padding(padding)) {
            if (state.isLoading) {
                CircularProgressIndicator(Modifier.align(Alignment.Center))
            } else {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .verticalScroll(rememberScrollState())
                        .padding(12.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    // 自己PR
                    SectionCard(title = "自己PR") {
                        OutlinedTextField(
                            value = state.prText,
                            onValueChange = viewModel::setPrText,
                            placeholder = { Text("強み・実績・志望動機など") },
                            modifier = Modifier.fillMaxWidth().height(140.dp),
                        )
                    }

                    // 希望条件
                    SectionCard(title = "希望条件") {
                        OutlinedTextField(
                            value = state.jobPreference,
                            onValueChange = viewModel::setJobPreference,
                            placeholder = { Text("希望業種・職種・勤務地・年収など") },
                            modifier = Modifier.fillMaxWidth().height(120.dp),
                        )
                    }

                    // 学歴
                    SectionCard(
                        title = "学歴",
                        onAdd = viewModel::addEducation,
                    ) {
                        if (state.educations.isEmpty()) {
                            Text("「+」で学歴を追加", color = TextMuted, fontSize = 13.sp)
                        }
                        state.educations.forEachIndexed { index, edu ->
                            EducationCard(
                                edu = edu,
                                onChange = { viewModel.updateEducation(index, it) },
                                onRemove = { viewModel.removeEducation(index) },
                            )
                        }
                    }

                    // 職歴
                    SectionCard(
                        title = "職歴",
                        onAdd = viewModel::addWorkExperience,
                    ) {
                        if (state.workExperiences.isEmpty()) {
                            Text("「+」で職歴を追加", color = TextMuted, fontSize = 13.sp)
                        }
                        state.workExperiences.forEachIndexed { index, w ->
                            WorkExperienceCard(
                                work = w,
                                onChange = { viewModel.updateWorkExperience(index, it) },
                                onRemove = { viewModel.removeWorkExperience(index) },
                            )
                        }
                    }

                    // 資格
                    SectionCard(
                        title = "資格",
                        onAdd = viewModel::addCertification,
                    ) {
                        if (state.certifications.isEmpty()) {
                            Text("「+」で資格を追加", color = TextMuted, fontSize = 13.sp)
                        }
                        state.certifications.forEachIndexed { index, c ->
                            CertificationCard(
                                cert = c,
                                onChange = { viewModel.updateCertification(index, it) },
                                onRemove = { viewModel.removeCertification(index) },
                            )
                        }
                    }

                    state.error?.let {
                        Text(it, color = MaterialTheme.colorScheme.error, fontSize = 13.sp)
                    }

                    Spacer(Modifier.height(40.dp))
                }
            }
        }
    }
}

@Composable
private fun SectionCard(
    title: String,
    onAdd: (() -> Unit)? = null,
    content: @Composable () -> Unit,
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color.White, RoundedCornerShape(12.dp))
            .padding(16.dp),
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(title, fontSize = 15.sp, fontWeight = FontWeight.Bold, color = TextDark)
                Box(modifier = Modifier.weight(1f))
                if (onAdd != null) {
                    IconButton(onClick = onAdd) {
                        Icon(Icons.Default.Add, contentDescription = "追加", tint = MaterialTheme.colorScheme.primary)
                    }
                }
            }
            content()
        }
    }
}

@Composable
private fun ItemCard(onRemove: () -> Unit, content: @Composable () -> Unit) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .background(PageBg, RoundedCornerShape(8.dp))
            .padding(12.dp),
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            content()
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) {
                OutlinedButton(onClick = onRemove) {
                    Icon(Icons.Default.Delete, contentDescription = null)
                    Spacer(Modifier.padding(2.dp))
                    Text("削除", fontSize = 12.sp)
                }
            }
        }
    }
}

@Composable
private fun EducationCard(edu: Education, onChange: (Education) -> Unit, onRemove: () -> Unit) {
    ItemCard(onRemove = onRemove) {
        OutlinedTextField(
            value = edu.schoolName,
            onValueChange = { onChange(edu.copy(schoolName = it)) },
            label = { Text("学校名") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
        )
        OutlinedTextField(
            value = edu.faculty.orEmpty(),
            onValueChange = { onChange(edu.copy(faculty = it.ifBlank { null })) },
            label = { Text("学部・学科（任意）") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
        )
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            OutlinedTextField(
                value = edu.schoolType,
                onValueChange = { onChange(edu.copy(schoolType = it)) },
                label = { Text("区分") },
                modifier = Modifier.weight(1f),
                singleLine = true,
            )
            OutlinedTextField(
                value = edu.status,
                onValueChange = { onChange(edu.copy(status = it)) },
                label = { Text("状態") },
                modifier = Modifier.weight(1f),
                singleLine = true,
            )
        }
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            OutlinedTextField(
                value = edu.year.toString(),
                onValueChange = { onChange(edu.copy(year = it.toIntOrNull() ?: edu.year)) },
                label = { Text("年") },
                modifier = Modifier.weight(1f),
                singleLine = true,
            )
            OutlinedTextField(
                value = edu.month.toString(),
                onValueChange = { onChange(edu.copy(month = it.toIntOrNull() ?: edu.month)) },
                label = { Text("月") },
                modifier = Modifier.weight(1f),
                singleLine = true,
            )
        }
    }
}

@Composable
private fun WorkExperienceCard(work: WorkExperience, onChange: (WorkExperience) -> Unit, onRemove: () -> Unit) {
    ItemCard(onRemove = onRemove) {
        OutlinedTextField(
            value = work.companyName,
            onValueChange = { onChange(work.copy(companyName = it)) },
            label = { Text("会社名") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
        )
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            OutlinedTextField(
                value = work.department.orEmpty(),
                onValueChange = { onChange(work.copy(department = it.ifBlank { null })) },
                label = { Text("部署") },
                modifier = Modifier.weight(1f),
                singleLine = true,
            )
            OutlinedTextField(
                value = work.jobType.orEmpty(),
                onValueChange = { onChange(work.copy(jobType = it.ifBlank { null })) },
                label = { Text("職種") },
                modifier = Modifier.weight(1f),
                singleLine = true,
            )
        }
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            OutlinedTextField(
                value = work.startYear.toString(),
                onValueChange = { onChange(work.copy(startYear = it.toIntOrNull() ?: work.startYear)) },
                label = { Text("入社年") },
                modifier = Modifier.weight(1f),
                singleLine = true,
            )
            OutlinedTextField(
                value = work.startMonth.toString(),
                onValueChange = { onChange(work.copy(startMonth = it.toIntOrNull() ?: work.startMonth)) },
                label = { Text("月") },
                modifier = Modifier.weight(1f),
                singleLine = true,
            )
        }
        if (!work.isCurrent) {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(
                    value = work.endYear?.toString().orEmpty(),
                    onValueChange = { onChange(work.copy(endYear = it.toIntOrNull())) },
                    label = { Text("退社年") },
                    modifier = Modifier.weight(1f),
                    singleLine = true,
                )
                OutlinedTextField(
                    value = work.endMonth?.toString().orEmpty(),
                    onValueChange = { onChange(work.copy(endMonth = it.toIntOrNull())) },
                    label = { Text("月") },
                    modifier = Modifier.weight(1f),
                    singleLine = true,
                )
            }
        }
        Row(verticalAlignment = Alignment.CenterVertically) {
            Checkbox(
                checked = work.isCurrent,
                onCheckedChange = {
                    onChange(work.copy(isCurrent = it, endYear = if (it) null else work.endYear, endMonth = if (it) null else work.endMonth))
                },
            )
            Text("現在も在籍中", fontSize = 13.sp)
        }
        OutlinedTextField(
            value = work.description.orEmpty(),
            onValueChange = { onChange(work.copy(description = it.ifBlank { null })) },
            label = { Text("業務内容（任意）") },
            modifier = Modifier.fillMaxWidth().height(100.dp),
        )
    }
}

@Composable
private fun CertificationCard(cert: Certification, onChange: (Certification) -> Unit, onRemove: () -> Unit) {
    ItemCard(onRemove = onRemove) {
        OutlinedTextField(
            value = cert.name,
            onValueChange = { onChange(cert.copy(name = it)) },
            label = { Text("資格名") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
        )
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            OutlinedTextField(
                value = cert.year.toString(),
                onValueChange = { onChange(cert.copy(year = it.toIntOrNull() ?: cert.year)) },
                label = { Text("取得年") },
                modifier = Modifier.weight(1f),
                singleLine = true,
            )
            OutlinedTextField(
                value = cert.month.toString(),
                onValueChange = { onChange(cert.copy(month = it.toIntOrNull() ?: cert.month)) },
                label = { Text("月") },
                modifier = Modifier.weight(1f),
                singleLine = true,
            )
        }
    }
}
