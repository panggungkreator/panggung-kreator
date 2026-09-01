import { createServiceRoleClient } from '@/lib/supabase/service-role';
import { NextRequest, NextResponse } from 'next/server';

function buildCompactPayload(data: Record<string, any>): string {
  return Object.entries(data)
    .filter(([, v]) => v !== null && v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0))
    .map(([k, v]) => `${k}:${Array.isArray(v) ? v.join('|') : v}`)
    .join('\n');
}

export async function POST(req: NextRequest) {
  try {
    const { member_id } = await req.json();
    if (!member_id) {
      return NextResponse.json({ error: 'Missing member_id' }, { status: 400 });
    }

    const supabase = createServiceRoleClient();

    // 1. Ambil data member (hanya field relevan)
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('full_name, occupation, birth_date, address')
      .eq('id', member_id)
      .single();

    if (memberError || !member) {
      return NextResponse.json({ error: memberError?.message || 'Member not found' }, { status: 404 });
    }

    // 2. Ambil data minat & kendala member
    const { data: interests, error: interestsError } = await supabase
      .from('member_interests')
      .select(`
        ps_challenges, confidence_scale, nervous_trigger,
        skills_to_master, role_model, monetization_interest,
        career_goal, first_opportunity,
        main_topic, main_message, target_audience, expert_desire,
        active_communities, career_obstacle, time_commitment
      `)
      .eq('member_id', member_id)
      .single();

    if (interestsError || !interests) {
      return NextResponse.json({ error: interestsError?.message || 'Interests not found' }, { status: 404 });
    }

    // 3. Preprocess data menjadi format compact key:value (skip null/kosong)
    const age = member.birth_date
      ? new Date().getFullYear() - new Date(member.birth_date).getFullYear()
      : null;

    const memberPayload = buildCompactPayload({
      nama: member.full_name,
      pekerjaan: member.occupation,
      ...(age ? { usia: `${age}th` } : {}),
      ...(member.address ? { domisili: member.address } : {}),
    });

    const interestsPayload = buildCompactPayload({
      tantangan_ps: interests.ps_challenges,
      percaya_diri: interests.confidence_scale,
      pemicu_gugup: interests.nervous_trigger,
      skill_target: interests.skills_to_master,
      role_model: interests.role_model,
      monetisasi: interests.monetization_interest,
      goal_karier: interests.career_goal,
      peluang_dicari: interests.first_opportunity,
      topik_konten: interests.main_topic,
      pesan_utama: interests.main_message,
      target_audiens: interests.target_audience,
      keinginan_expert: interests.expert_desire,
      komunitas_lain: interests.active_communities,
      kendala_karier: interests.career_obstacle,
      komitmen: interests.time_commitment,
    });

    const SYSTEM_PROMPT = `Kamu adalah AI analis profil di Panggung Kreator. Berdasarkan data kuesioner, hasilkan analisis mendalam dalam format JSON dengan struktur tepat sebagai berikut (bahasa Indonesia, ringkas & padat, maksimal 2 kalimat per field):

{"ringkasan":"[Siapa member ini: profesi, usia estimasi, karakter kreator]","diagnosis_ps":"[Pola kelemahan public speaking dari tantangan + skor percaya diri. Sertakan 1 quick win]","potensi_konten":"[Topik konten terkuat, model monetisasi paling realistis, relevansi role model]","roadmap":"[3 fase singkat: Fondasi -> Tumbuh -> Monetisasi]","insight_mentor":"[Cluster member sejenis, materi paling relevan, flag risiko/potensi]","rekomendasi_ekosistem":"[Topik course online ideal, jenis event/workshop cocok, komunitas kolaborasi]"}

ATURAN PENTING:
1. Output HARUS JSON valid murni tanpa markdown formatting.
2. Setiap nilai string HARUS ditulis padat tanpa baris baru (newline).`;

    const USER_PROMPT = `PROFIL:\n${memberPayload}\n\nKUESIONER:\n${interestsPayload}`;

    let aiText = '';

    // 4. Panggilan ke LLM (Gemini dengan Fallback ke Groq)
    const MODELS_TO_TRY = [
      'gemini-3.6-flash',
      'gemini-3.5-flash',
      'gemini-flash-latest'
    ];

    if (process.env.GEMINI_API_KEY) {
      for (const modelName of MODELS_TO_TRY) {
        try {
          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: USER_PROMPT }] }],
                systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
                generationConfig: {
                  responseMimeType: "application/json",
                  temperature: 0.3,
                  maxOutputTokens: 2000,
                },
              }),
            }
          );

          if (res.ok) {
            const json = await res.json();
            aiText = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
            if (aiText) break;
          }
        } catch (geminiErr) {
          console.warn(`Gemini model ${modelName} failed:`, geminiErr);
        }
      }
    }

    // Fallback ke Groq (llama-3.3-70b-versatile) jika Gemini belum berhasil
    if (!aiText && process.env.GROQ_API_KEY) {
      try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              { role: 'user', content: USER_PROMPT },
            ],
            response_format: { type: "json_object" },
            temperature: 0.3,
            max_tokens: 2000,
          }),
        });

        if (res.ok) {
          const json = await res.json();
          aiText = json.choices?.[0]?.message?.content || '';
        }
      } catch (groqErr) {
        console.error("Groq API call failed:", groqErr);
      }
    }

    if (!aiText) {
      return NextResponse.json({ error: 'LLM providers failed to analyze profile' }, { status: 500 });
    }

    // 5. Validasi & Parsing JSON
    let aiJson: Record<string, string>;
    try {
      const cleanStr = aiText
        .trim()
        .replace(/^```json\s*/i, '')
        .replace(/\s*```$/i, '')
        .replace(/[\r\n]+/g, ' '); // Ganti newline mentah dengan spasi agar JSON.parse selalu sukses

      aiJson = JSON.parse(cleanStr);

      const REQUIRED_KEYS = ['ringkasan', 'diagnosis_ps', 'potensi_konten', 'roadmap', 'insight_mentor', 'rekomendasi_ekosistem'];
      const missing = REQUIRED_KEYS.filter((k) => !aiJson[k]);
      if (missing.length > 0) {
        console.warn("AI JSON output missing keys:", missing);
      }
    } catch (parseErr) {
      console.error("Failed to parse AI response as JSON:", parseErr);
      aiJson = { legacy: aiText };
    }

    // 6. Simpan hasil analisis sebagai JSONB
    const { error: updateError } = await supabase
      .from('member_interests')
      .update({ ai_analysis: aiJson, updated_at: new Date().toISOString() })
      .eq('member_id', member_id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, analysis: aiJson });
  } catch (err: any) {
    console.error("analyze-interests error:", err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
