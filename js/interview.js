// ============================================================
// interview.js - NPC Interview Panel
// ============================================================

class InterviewPanel {
  constructor(game) {
    this.game = game;
    this.visible = false;
    this.currentNPC = null;
    this.currentCiv = null;
    this.conversationHistory = [];
    this.selectedCategory = null;
    this.isTyping = false;
    this.onClose = null;
  }

  // Convenience helper — reads from I18N if available, else returns key as-is
  _t(key) {
    return (typeof I18N !== 'undefined') ? I18N.t(key) : key;
  }

  show(civ) {
    this.currentCiv = civ || this.game.civilizations.find(c => c.isPlayerCiv) || this.game.civilizations[0];
    if (!this.currentCiv) return;

    this.currentNPC = null;
    this.conversationHistory = [];
    this.selectedCategory = null;
    this.visible = true;
    this.render();
  }

  hide() {
    this.visible = false;
    const panel = Utils.el('interview-panel');
    if (panel) panel.style.display = 'none';
  }

  render() {
    const panel = Utils.el('interview-panel');
    if (!panel) return;
    panel.style.display = 'flex';
    panel.innerHTML = '';

    // ── Header ─────────────────────────────────────────────────
    const header = Utils.createEl('div', 'panel-header');
    const civName = this.currentCiv?.name || '';
    const subtitle = this._t('panelSubtitle') + ' ' + civName + this._t('panelSubtitleSuffix');
    header.innerHTML = `<h2>${this._t('panelTitle')}</h2><p class="panel-subtitle">${subtitle}</p>`;
    const closeBtn = Utils.createEl('button', 'close-btn', '✕');
    closeBtn.onclick = () => { this.hide(); if (this.onClose) this.onClose(); };
    header.appendChild(closeBtn);
    panel.appendChild(header);

    // ── Two-pane layout ─────────────────────────────────────────
    const body = Utils.createEl('div', 'interview-body');

    // Left: NPC selector + categories
    const leftPane = Utils.createEl('div', 'interview-left');
    this._renderNPCSelector(leftPane);
    this._renderCivSelector(leftPane);
    if (this.currentNPC) {
      this._renderNPCCard(leftPane);
      this._renderCategories(leftPane);
    }
    body.appendChild(leftPane);

    // Right: Conversation
    const rightPane = Utils.createEl('div', 'interview-right');
    if (this.currentNPC) {
      this._renderConversation(rightPane);
    } else {
      const prompt = Utils.createEl('div', 'interview-prompt');
      prompt.innerHTML = `<div class="interview-prompt-icon">🧑</div><p>${this._t('selectPrompt')}</p>`;
      rightPane.appendChild(prompt);
    }
    body.appendChild(rightPane);

    panel.appendChild(body);
  }

  _renderCivSelector(container) {
    if (this.game.civilizations.length < 2) return;
    const wrap = Utils.createEl('div', 'form-group');
    const label = Utils.createEl('label', '', this._t('civilizationLabel'));
    const sel = Utils.createEl('select', 'civ-selector');
    for (const civ of this.game.civilizations) {
      const opt = document.createElement('option');
      opt.value = civ.id;
      opt.textContent = civ.name;
      if (civ.id === this.currentCiv?.id) opt.selected = true;
      sel.appendChild(opt);
    }
    sel.onchange = () => {
      this.currentCiv = this.game.civilizations.find(c => c.id === sel.value);
      this.currentNPC = null;
      this.conversationHistory = [];
      this.render();
    };
    wrap.appendChild(label);
    wrap.appendChild(sel);
    container.appendChild(wrap);
  }

  _renderNPCSelector(container) {
    const civ = this.currentCiv;
    if (!civ || !civ.npcs || civ.npcs.length === 0) return;

    const title = Utils.createEl('div', 'section-title', this._t('chooseACitizen'));
    container.appendChild(title);

    // Filter by social position
    const filterWrap = Utils.createEl('div', 'npc-filter');
    const positions = ['all', ...new Set(civ.npcs.map(n => n.socialPosition))];
    for (const pos of positions) {
      const label = pos === 'all' ? this._t('filterAll') : (this._t('pos_' + pos) || Utils.capitalize(pos));
      const btn = Utils.createEl('button', `filter-btn ${(!this._posFilter || this._posFilter === pos) && pos === 'all' ? 'active' : ''} ${this._posFilter === pos ? 'active' : ''}`, label);
      btn.onclick = () => {
        this._posFilter = pos === 'all' ? null : pos;
        this.render();
      };
      filterWrap.appendChild(btn);
    }
    container.appendChild(filterWrap);

    const npcs = this._posFilter ? civ.npcs.filter(n => n.socialPosition === this._posFilter) : civ.npcs;

    const list = Utils.createEl('div', 'npc-list');
    for (const npc of npcs.slice(0, 12)) {
      const item = Utils.createEl('div', `npc-list-item ${npc === this.currentNPC ? 'selected' : ''}`);
      item.innerHTML = `
        <div class="npc-list-name">${npc.name}</div>
        <div class="npc-list-meta">${npc.age}y · ${Utils.capitalize(npc.socialPosition)}</div>
        <div class="npc-happiness-bar">
          <div style="width:${npc.happiness}%; background: ${npc.happiness > 60 ? '#00d4aa' : npc.happiness > 35 ? '#f0a020' : '#ff6b6b'}"></div>
        </div>
      `;
      item.onclick = () => {
        this.currentNPC = npc;
        this.conversationHistory = [];
        this.selectedCategory = null;
        this.render();
      };
      list.appendChild(item);
    }
    container.appendChild(list);

    // Random NPC button
    const randomBtn = Utils.createEl('button', 'btn btn-secondary btn-sm', this._t('randomCitizen'));
    randomBtn.onclick = () => {
      this.currentNPC = Utils.randChoice(civ.npcs);
      this.conversationHistory = [];
      this.selectedCategory = null;
      this.render();
    };
    container.appendChild(randomBtn);
  }

  _renderNPCCard(container) {
    const npc = this.currentNPC;
    const civ = this.currentCiv;

    const card = Utils.createEl('div', 'npc-detail-card');
    card.innerHTML = `
      <div class="npc-avatar">${this._getAvatarIcon(npc)}</div>
      <div class="npc-detail-info">
        <div class="npc-detail-name">${npc.name}</div>
        <div class="npc-detail-meta">${npc.age}-year-old ${npc.gender}</div>
        <div class="npc-detail-position">${this._t('pos_' + npc.socialPosition) || Utils.capitalize(npc.socialPosition)}</div>
        ${npc.religiousAffiliation ? `<div class="npc-religion">⛪ ${npc.religiousAffiliation}</div>` : ''}
      </div>
      <div class="npc-meters">
        <div class="meter-row">
          <span>${this._t('npc_wellbeing')}</span>
          <div class="mini-bar"><div style="width:${npc.happiness}%"></div></div>
        </div>
        <div class="meter-row">
          <span>${this._t('npc_empathy')}</span>
          <div class="mini-bar"><div style="width:${npc.empathy}%"></div></div>
        </div>
        <div class="meter-row">
          <span>${this._t('npc_econ_status')}</span>
          <div class="mini-bar"><div style="width:${npc.economicStatus}%"></div></div>
        </div>
      </div>
    `;

    // Life history
    if (npc.lifeEvents.length > 0) {
      const histTitle = Utils.createEl('div', 'npc-hist-title', this._t('lifeHistory'));
      card.appendChild(histTitle);
      const hist = Utils.createEl('ul', 'npc-hist-list');
      for (const event of npc.lifeEvents) {
        const li = Utils.createEl('li', '', event);
        hist.appendChild(li);
      }
      card.appendChild(hist);
    }

    container.appendChild(card);
  }

  _renderCategories(container) {
    const title = Utils.createEl('div', 'section-title', this._t('topic'));
    container.appendChild(title);
    const grid = Utils.createEl('div', 'category-grid');
    for (const cat of INTERVIEW_CATEGORIES) {
      // Use translated category label if available, fall back to cat.label
      const catLabel = this._t('cat_' + cat.id);
      const displayLabel = (catLabel !== 'cat_' + cat.id) ? catLabel : cat.label;
      const btn = Utils.createEl('button', `category-btn ${this.selectedCategory === cat.id ? 'active' : ''}`,
        `${cat.icon} ${displayLabel}`);
      btn.onclick = () => {
        this.selectedCategory = cat.id;
        this.render();
      };
      grid.appendChild(btn);
    }
    container.appendChild(grid);
  }

  _renderConversation(container) {
    const npc = this.currentNPC;
    const civ = this.currentCiv;

    // Introduction
    if (this.conversationHistory.length === 0) {
      const intro = Utils.createEl('div', 'interview-intro');
      intro.innerHTML = `<p>${InterviewEngine.getNPCIntroduction(npc, civ)}</p>`;
      container.appendChild(intro);
    }

    // Conversation history
    const chatArea = Utils.createEl('div', 'chat-area');
    for (const msg of this.conversationHistory) {
      const bubble = Utils.createEl('div', `chat-bubble ${msg.role}`);
      bubble.innerHTML = `
        <div class="bubble-sender">${msg.role === 'user' ? 'You' : npc.name}</div>
        <div class="bubble-text">${msg.content}</div>
      `;
      chatArea.appendChild(bubble);
    }

    if (this.isTyping) {
      const typing = Utils.createEl('div', 'chat-bubble npc typing');
      typing.innerHTML = `<div class="bubble-sender">${npc.name}</div><div class="bubble-text">...</div>`;
      chatArea.appendChild(typing);
    }

    container.appendChild(chatArea);

    // Suggested questions
    if (this.selectedCategory) {
      const suggestedTitle = Utils.createEl('div', 'suggested-title', this._t('suggestedTitle'));
      container.appendChild(suggestedTitle);

      const questions = InterviewEngine.getSuggestedQuestions(this.selectedCategory);
      const questionsWrap = Utils.createEl('div', 'suggested-questions');
      for (const q of questions) {
        const btn = Utils.createEl('button', 'suggested-q-btn', q);
        btn.onclick = () => this._askQuestion(q);
        questionsWrap.appendChild(btn);
      }
      container.appendChild(questionsWrap);
    }

    // Custom input
    const inputArea = Utils.createEl('div', 'chat-input-area');
    const input = Utils.createEl('input', 'chat-input');
    input.setAttribute('type', 'text');
    input.setAttribute('placeholder', this._t('customPlaceholder'));
    input.onkeydown = e => { if (e.key === 'Enter' && input.value.trim()) this._askQuestion(input.value.trim()); };
    const sendBtn = Utils.createEl('button', 'btn btn-primary btn-sm', this._t('askBtn'));
    sendBtn.onclick = () => { if (input.value.trim()) this._askQuestion(input.value.trim()); };
    inputArea.appendChild(input);
    inputArea.appendChild(sendBtn);
    container.appendChild(inputArea);

    // LLM status
    const settings = this.game.settings;
    const llmStatus = Utils.createEl('div', 'llm-status');
    const hasLLM = settings?.apiProvider === 'ollama' || !!settings?.apiKey;
    if (hasLLM) {
      const providerLabels = { ollama: 'Ollama', groq: 'Groq', gemini: 'Gemini', anthropic: 'Claude', openai: 'GPT' };
      const label = providerLabels[settings.apiProvider] || settings.apiProvider || 'LLM';
      llmStatus.innerHTML = `<span class="llm-on">${this._t('llmOn')} (${label})</span>`;
    } else {
      llmStatus.innerHTML = `<span class="llm-off">${this._t('llmOff')} | <a href="#" class="settings-link" id="open-settings-from-interview">${this._t('enableLLM')}</a></span>`;
    }
    container.appendChild(llmStatus);

    const settingsLink = container.querySelector('#open-settings-from-interview');
    if (settingsLink) {
      settingsLink.onclick = (e) => {
        e.preventDefault();
        this.hide();
        if (this.game.ui) this.game.ui.showSettings();
      };
    }

    // Scroll to bottom
    setTimeout(() => { chatArea.scrollTop = chatArea.scrollHeight; }, 50);
  }

  async _askQuestion(question) {
    if (!this.currentNPC || !this.currentCiv || this.isTyping) return;

    // Add user message
    this.conversationHistory.push({ role: 'user', content: question });
    this.isTyping = true;
    this.render();

    const npc = this.currentNPC;
    const civ = this.currentCiv;
    const settings = this.game.settings;

    let response;

    // Ollama needs no API key — all other LLM providers require one
    const hasLLM = settings?.apiProvider === 'ollama' || !!settings?.apiKey;
    // Small local models (tinyllama) only produce reliable output in English.
    // For other languages, skip the LLM and use localized rule-based responses.
    const lang = I18N?.currentLanguage || 'en';
    const llmSupportsLang = lang === 'en' || (settings?.apiProvider !== 'ollama');
    const useLLM = hasLLM && llmSupportsLang;
    console.log(`[LLM] Decision: provider="${settings?.apiProvider}" hasKey=${!!settings?.apiKey} lang="${lang}" → ${useLLM ? 'LLM' : 'rules-based'}`);
    if (useLLM) {
      response = await this._fetchLLMResponse(npc, civ, question);
    } else {
      // Slight delay to feel more natural
      await new Promise(r => setTimeout(r, 600 + Math.random() * 800));
      response = InterviewEngine.getRuleBasedResponse(npc, civ, question, this.selectedCategory || 'daily_life', this.conversationHistory, this.game.currentYear);
    }

    this.conversationHistory.push({ role: 'npc', content: response });
    this.isTyping = false;
    this.render();
  }

  async _fetchLLMResponse(npc, civ, question) {
    const settings  = this.game.settings;
    const provider  = settings.apiProvider || 'none';
    const customModel = settings.apiModel?.trim();

    // Default models per provider
    const DEFAULT_MODELS = {
      ollama:    'mistral',
      groq:      'llama-3.1-8b-instant',
      gemini:    'gemini-1.5-flash',
      anthropic: 'claude-haiku-4-5-20251001',
      openai:    'gpt-4o-mini',
    };
    const model = customModel || DEFAULT_MODELS[provider] || 'mistral';

    console.log(`[LLM] Attempting ${provider} with model="${model}" hasKey=${!!settings.apiKey}`);

    const prompt = InterviewEngine.buildLLMPrompt(npc, civ, question, this.conversationHistory.slice(-6));

    // Timeout: abort if LLM takes too long (local models can freeze the system)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000); // 45 seconds

    try {
      // ── Ollama (local, no auth) ─────────────────────────────
      if (provider === 'ollama') {
        const ollamaUrl = (settings.ollamaUrl || 'http://localhost:11434').replace(/\/$/, '');
        const res = await Utils.llmFetch(`${ollamaUrl}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: prompt }],
            stream: false,
            options: { num_predict: 200, stop: ['Interviewer:', '\nInterviewer', '\n\n\n'] },
          }),
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`Ollama HTTP ${res.status}: ${res.statusText}`);
        const data = await res.json();
        if (data.message?.content) {
          const cleaned = this._cleanLLMResponse(data.message.content);
          if (cleaned) return cleaned;
          // Model echoed prompt context — fall through to rule-based
          console.warn('[LLM] tinyllama echoed prompt context; falling back to rule-based response');
        }
        if (data.error) throw new Error(data.error);

      // ── Groq (OpenAI-compatible, free tier) ────────────────
      } else if (provider === 'groq') {
        console.log(`[LLM] Groq: POST chat/completions model=${model}`);
        const res = await Utils.llmFetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${settings.apiKey}`,
          },
          body: JSON.stringify({
            model,
            max_tokens: 300,
            stop: ['Interviewer:', '\nInterviewer'],
            messages: [{ role: 'user', content: prompt }],
          }),
          signal: controller.signal,
        });
        console.log(`[LLM] Groq response: HTTP ${res.status}`);
        if (!res.ok) {
          const errBody = await res.text().catch(() => '');
          throw new Error(`Groq HTTP ${res.status}: ${errBody || res.statusText}`);
        }
        const data = await res.json();
        console.log(`[LLM] Groq data keys:`, Object.keys(data));
        if (data.choices?.[0]?.message?.content) return this._cleanLLMResponse(data.choices[0].message.content);
        if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));

      // ── Google Gemini ───────────────────────────────────────
      } else if (provider === 'gemini') {
        const res = await Utils.llmFetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${settings.apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { maxOutputTokens: 300, stopSequences: ['Interviewer:'] },
            }),
            signal: controller.signal,
          }
        );
        if (!res.ok) {
          const errBody = await res.text().catch(() => '');
          throw new Error(`Gemini HTTP ${res.status}: ${errBody || res.statusText}`);
        }
        const data = await res.json();
        if (data.candidates?.[0]?.content?.parts?.[0]?.text)
          return this._cleanLLMResponse(data.candidates[0].content.parts[0].text);
        if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));

      // ── Anthropic (Claude) ──────────────────────────────────
      } else if (provider === 'anthropic') {
        const res = await Utils.llmFetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': settings.apiKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true',
          },
          body: JSON.stringify({
            model,
            max_tokens: 300,
            stop_sequences: ['Interviewer:', '\n\nInterviewer'],
            messages: [{ role: 'user', content: prompt }],
          }),
          signal: controller.signal,
        });
        if (!res.ok) {
          const errBody = await res.text().catch(() => '');
          throw new Error(`Anthropic HTTP ${res.status}: ${errBody || res.statusText}`);
        }
        const data = await res.json();
        if (data.content?.[0]?.text) return this._cleanLLMResponse(data.content[0].text);
        if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));

      // ── OpenAI (GPT) ────────────────────────────────────────
      } else if (provider === 'openai') {
        const res = await Utils.llmFetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${settings.apiKey}`,
          },
          body: JSON.stringify({
            model,
            max_tokens: 300,
            stop: ['Interviewer:', '\nInterviewer'],
            messages: [{ role: 'user', content: prompt }],
          }),
          signal: controller.signal,
        });
        if (!res.ok) {
          const errBody = await res.text().catch(() => '');
          throw new Error(`OpenAI HTTP ${res.status}: ${errBody || res.statusText}`);
        }
        const data = await res.json();
        if (data.choices?.[0]?.message?.content) return this._cleanLLMResponse(data.choices[0].message.content);
        if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
      }

    } catch (err) {
      clearTimeout(timeout);
      console.error(`[LLM] Error (${provider}):`, err);
      const reason = err?.name === 'AbortError'
        ? ': request timed out (model may be too large for this machine — try a smaller model like tinyllama)'
        : err?.message ? `: ${err.message}` : '';
      const fallback = InterviewEngine.getRuleBasedResponse(
        npc, civ, question, this.selectedCategory || 'daily_life', [], this.game.currentYear);
      return fallback + ` [LLM (${provider}) unavailable${reason} — rule-based response used]`;
    }
    clearTimeout(timeout);

    // If we reached here, the provider returned 200 but the response JSON didn't
    // match the expected format — log it so the user can report the issue.
    console.error(`[LLM] ${provider} returned OK but response had no extractable content`);
    const fallback = InterviewEngine.getRuleBasedResponse(
      npc, civ, question, this.selectedCategory || 'daily_life', [], this.game.currentYear);
    return fallback + ` [LLM (${provider}): unexpected response format — rule-based response used]`;
  }

  /** Strip any hallucinated interviewer/continuation lines AND echoed prompt context from LLM output.
   *  Small models like tinyllama (1B) sometimes echo the system prompt instead of generating
   *  a novel response. This method detects and strips that echoed context. */
  _cleanLLMResponse(text) {
    let clean = text.trim();

    // Strip echoed prompt context — small models sometimes repeat the system prompt.
    // Detect by looking for known prompt markers that should never appear in a response.
    const promptMarkers = [
      'CIVILIZATION CONTEXT:',
      'CiviliZation Context:',
      'CHARACTER:',
      'Characters:',
      'Social position:',
      'Economic status:',
      'Empathy level:',
      'Habitability:',
      'Religious affiliation:',
      'Personal history:',
      'Dominant behavior reinforced',
      'Economic status:',
      'Empathy level:',
      'INSTRUCTIONS:',
      'You are roleplaying',
      '- Era:',
      '- Economic system:',
      '- Governance:',
      '- Religion:',
    ];
    for (const marker of promptMarkers) {
      const idx = clean.indexOf(marker);
      if (idx >= 0) {
        // The model echoed the prompt. Try to find where the actual response starts
        // (after the prompt context ends). Look for the last prompt marker and take text after it.
        let lastMarkerEnd = 0;
        for (const m of promptMarkers) {
          const mIdx = clean.lastIndexOf(m);
          if (mIdx >= 0) {
            // Find end of this marker's line
            const lineEnd = clean.indexOf('\n', mIdx + m.length);
            if (lineEnd > lastMarkerEnd) lastMarkerEnd = lineEnd;
          }
        }
        // Take everything after the last prompt marker line
        if (lastMarkerEnd > 0 && lastMarkerEnd < clean.length - 10) {
          clean = clean.substring(lastMarkerEnd).trim();
        } else {
          // Entire response is echoed prompt — return a fallback indicator
          // so the caller can use rule-based response instead
          return '';
        }
        break;
      }
    }

    // Remove "Interviewee:" or the NPC name prefix if the model echoed it
    clean = clean.replace(/^(Interviewee|Interview(er)?)\s*:\s*/i, '');
    // Truncate at any hallucinated interviewer continuation
    const cutPatterns = [/\nInterviewer\s*:/i, /\nInterviewee\s*:/i, /\n\n\n/];
    for (const pat of cutPatterns) {
      const m = clean.search(pat);
      if (m > 0) clean = clean.slice(0, m);
    }
    return clean.trim();
  }

  _getAvatarIcon(npc) {
    const icons = {
      leader:       '👑',
      elite:        '🎩',
      professional: '📋',
      laborer:      '🔨',
      marginalized: '🌱',
    };
    return icons[npc.socialPosition] || '🧑';
  }
}
