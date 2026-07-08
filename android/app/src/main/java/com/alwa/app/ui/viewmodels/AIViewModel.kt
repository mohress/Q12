package com.alwa.app.ui.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.alwa.app.data.ChatMessage
import com.alwa.app.data.GeminiRepository
import com.alwa.app.data.GeminiResult
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class AIViewModel : ViewModel() {

    private val _chatHistory = MutableStateFlow<List<ChatMessage>>(
        listOf(
            ChatMessage("model", "يا أهلاً بيك يا فنان! أنا علاوي مساعدك الذكي لسوق الخضار والفاكهة. قولي حابب تعمل تحليل للمبيعات أو تتوقع سعر محصول إيه النهارده؟")
        )
    )
    val chatHistory: StateFlow<List<ChatMessage>> = _chatHistory.asStateFlow()

    private val _geminiResult = MutableStateFlow<GeminiResult>(GeminiResult.Success(""))
    val geminiResult: StateFlow<GeminiResult> = _geminiResult.asStateFlow()

    private val _isVoiceActive = MutableStateFlow(false)
    val isVoiceActive: StateFlow<Boolean> = _isVoiceActive.asStateFlow()

    fun sendMessage(apiKey: String, userMessage: String) {
        if (userMessage.isBlank()) return

        // 1. Add user message to history
        val updatedHistory = _chatHistory.value + ChatMessage("user", userMessage)
        _chatHistory.value = updatedHistory

        // 2. Setup Repository with user's specific API Key
        val repository = GeminiRepository(apiKey)

        // 3. Trigger Coroutine and collect API response Flow smoothly on background thread
        viewModelScope.launch {
            repository.getGeminiResponse(userMessage, updatedHistory.dropLast(1)).collect { result ->
                _geminiResult.value = result
                if (result is GeminiResult.Success) {
                    if (result.text.isNotBlank()) {
                        _chatHistory.value = _chatHistory.value + ChatMessage("model", result.text)
                    }
                }
            }
        }
    }

    fun clearChat() {
        _chatHistory.value = listOf(
            ChatMessage("model", "تمت إعادة تهيئة المحادثة بنجاح. أؤمرني يا غالي!")
        )
        _geminiResult.value = GeminiResult.Success("")
    }

    fun toggleVoiceOutput() {
        _isVoiceActive.value = !_isVoiceActive.value
    }
}
