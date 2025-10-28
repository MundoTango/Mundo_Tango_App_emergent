# Voice Mode Migration Checklist
**MB.MD SIMULTANEOUS Stream 5: Voice Mode Cost Optimization**  
**Target: $90K/month → $250/month (99.7% reduction)**  
**Created: October 28, 2025**

## Phase 1: Whisper Integration (Week 1) 🎙️

### Day 1-2: Environment Setup
- [ ] Install Whisper dependencies
  ```bash
  pip install openai-whisper
  # OR for faster inference:
  git clone https://github.com/ggerganov/whisper.cpp
  cd whisper.cpp && make
  ```
- [ ] Download Whisper models
  - [ ] whisper-tiny (39M) - for testing
  - [ ] whisper-base (74M) - for development
  - [ ] whisper-medium (769M) - for production
- [ ] Set up Whisper API endpoint in `server/services/voice/WhisperService.ts`
- [ ] Configure audio preprocessing pipeline

### Day 3-4: API Integration
- [ ] Create `/api/voice/transcribe` endpoint
- [ ] Implement audio format conversion (WebM → WAV)
- [ ] Add error handling and retry logic
- [ ] Set up audio chunking for long recordings

### Day 5-7: Testing & Optimization
- [ ] Accuracy testing: Compare Whisper vs OpenAI Realtime API
  - [ ] Test with 100 sample recordings
  - [ ] Measure Word Error Rate (WER)
  - [ ] Target: >95% accuracy match
- [ ] Performance benchmarking
  - [ ] Latency: <500ms for 30s audio
  - [ ] CPU usage monitoring
  - [ ] Memory optimization
- [ ] Load testing with 100 concurrent transcriptions

---

## Phase 2: Bark TTS Integration (Week 2) 🔊

### Day 8-9: Environment Setup
- [ ] Install Bark TTS
  ```bash
  pip install git+https://github.com/suno-ai/bark.git
  ```
- [ ] Download Bark models
  - [ ] text model (200MB)
  - [ ] coarse model (500MB)
  - [ ] fine model (1GB)
- [ ] Set up Bark API endpoint in `server/services/voice/BarkService.ts`

### Day 10-11: API Integration
- [ ] Create `/api/voice/synthesize` endpoint
- [ ] Implement text preprocessing for better pronunciation
- [ ] Add voice preset selection (12 available voices)
- [ ] Configure audio output format (WAV → WebM)

### Day 12-14: Quality Testing
- [ ] Voice quality testing: MOS (Mean Opinion Score) > 4.0/5.0
  - [ ] Test 10 different voices
  - [ ] User feedback collection
  - [ ] A/B testing vs OpenAI TTS
- [ ] Performance optimization
  - [ ] Latency: <2s for 100 words
  - [ ] GPU acceleration (if available)
  - [ ] Caching frequently used phrases

---

## Phase 3: Groq Integration & Full Pipeline (Week 3) 🤖

### Day 15-16: Groq Setup
- [ ] Create Groq Cloud account (free tier)
- [ ] Configure API key in environment
- [ ] Set up Groq client in `server/services/ai/GroqService.ts`
- [ ] Test Llama 3.3 70B model

### Day 17-18: Unified Pipeline
- [ ] Create `UnifiedVoicePipeline` service
  ```typescript
  // Voice Input → Whisper → Groq → Bark → Voice Output
  ```
- [ ] Implement end-to-end voice conversation flow
- [ ] Add conversation context management
- [ ] Set up WebSocket for real-time streaming

### Day 19-21: End-to-End Testing
- [ ] Integration testing
  - [ ] Test complete voice conversations
  - [ ] Verify context retention
  - [ ] Check error recovery
- [ ] Load testing
  - [ ] 100 concurrent voice sessions
  - [ ] Stress test with 1,000 requests/min
- [ ] Cost validation
  - [ ] Track actual costs per conversation
  - [ ] Verify $0 API costs
  - [ ] Calculate infrastructure costs

---

## Phase 4: Gradual Rollout & Migration (Week 4) 🚀

### Day 22-23: Feature Flag Setup
- [ ] Implement feature flag for voice mode selection
- [ ] Create admin toggle: OpenAI Realtime ↔ Open Source Pipeline
- [ ] Set up A/B testing framework
- [ ] Configure rollout percentages (0% → 20% → 50% → 100%)

### Day 24-25: 20% Rollout
- [ ] Deploy to 20% of users
- [ ] Monitor error rates
- [ ] Collect user feedback
- [ ] Compare quality metrics vs OpenAI
- [ ] Track cost savings

### Day 26-27: 50% Rollout
- [ ] Increase to 50% of users
- [ ] Performance monitoring
- [ ] Server resource optimization
- [ ] Bug fixes from 20% rollout

### Day 28: 100% Migration
- [ ] Deploy to 100% of users
- [ ] Deprecate OpenAI Realtime API
- [ ] Remove old voice mode code
- [ ] Update documentation

---

## Success Criteria ✅

### Performance Metrics
- [ ] Whisper STT accuracy: >95% (match OpenAI)
- [ ] Bark TTS quality: MOS >4.0/5.0
- [ ] End-to-end latency: <4s
- [ ] Error rate: <1%

### Cost Metrics
- [ ] API costs: $0/month ✅
- [ ] Infrastructure costs: <$250/month
- [ ] Total monthly cost: <$250/month
- [ ] Monthly savings: >$89,750

### User Satisfaction
- [ ] User feedback: >90% positive
- [ ] Conversation quality: ≥ OpenAI Realtime API
- [ ] Response time: <5s perceived latency
- [ ] Zero customer complaints about voice quality

---

## Rollback Plan 🔄

If any of these occur, rollback to OpenAI Realtime API:
- [ ] Error rate >5%
- [ ] Accuracy drops below 90%
- [ ] User complaints >10% of sessions
- [ ] Server crashes or performance degradation

**Rollback Process:**
1. Toggle feature flag to 0%
2. Route all traffic to OpenAI Realtime API
3. Investigate root cause
4. Fix issues in development
5. Re-test before retry

---

## Cost Tracking 💰

### Infrastructure Costs (Estimated)
| Component | Monthly Cost |
|-----------|-------------|
| Server CPU (8 cores) | $100 |
| RAM (16GB) | $50 |
| Storage (10GB models) | $10 |
| Bandwidth | $50 |
| **Total** | **$210** |

### Savings Validation
- [ ] Week 1: Validate Whisper costs = $0
- [ ] Week 2: Validate Bark costs = $0
- [ ] Week 3: Validate Groq costs = $0
- [ ] Week 4: Confirm total infrastructure <$250/month

**Target Achievement:**
- ✅ $90,000/month → $210/month
- ✅ 99.77% cost reduction
- ✅ Annual savings: $1.08 Million

---

## Next Steps After Migration

1. **Monitor & Optimize** (Month 2)
   - Fine-tune Whisper for tango-specific vocabulary
   - Optimize Bark voice selection
   - Cache common responses

2. **Scale Infrastructure** (Month 3)
   - Auto-scaling for peak usage
   - CDN for model distribution
   - Multi-region deployment

3. **Advanced Features** (Month 4+)
   - Custom voice cloning
   - Real-time translation
   - Emotion detection
   - Background noise filtering

---

**Status:** Ready for Phase 1 implementation ✅  
**Timeline:** 4 weeks from start to 100% migration  
**Risk Level:** Low (fallback to OpenAI available at any time)
