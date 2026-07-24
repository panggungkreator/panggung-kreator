import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { member_id } = await req.json()
    if (!member_id) {
      return NextResponse.json({ error: 'Missing member_id' }, { status: 400 })
    }

    const supabase = createServiceRoleClient()

    // 1. Ambil data member dan interests secara detail
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('full_name, stage_name, occupation, description, city')
      .eq('id', member_id)
      .single()

    if (memberError || !member) {
      return NextResponse.json({ error: memberError?.message || 'Member not found' }, { status: 404 })
    }

    const { data: interests, error: interestsError } = await supabase
      .from('member_interests')
      .select('*')
      .eq('member_id', member_id)
      .single()

    if (interestsError || !interests) {
      return NextResponse.json({ error: interestsError?.message || 'Interests not found' }, { status: 404 })
    }

    // 2. Siapkan prompt untuk AI
    const systemPrompt = `
Anda adalah Senior Mentor di Panggung Kreator. Tugas Anda adalah menganalisis data kuesioner profil member untuk memetakan kekuatan, minat utama, kendala terbesar, dan potensi karier mereka.
Hasil analisis Anda akan digunakan oleh mentor lain sebagai panduan mentoring.

Tulis output Anda dengan gaya profesional, terstruktur, dan suportif menggunakan bahasa Indonesia. Gunakan format markdown berikut:

### 1. RINGKASAN PROFIL
[Tulis 2-3 kalimat ringkasan tentang siapa member ini berdasarkan profesi dan kota]

### 2. KEKUATAN & MINAT UTAMA
- **Minat:** [Tulis minat utama mereka]
- **Tingkat Pengalaman:** [Sebutkan tingkat pengalaman mereka]
- **Potensi:** [Tulis analisis potensi mereka berdasarkan topik konten dan goal]

### 3. KENDALA UTAMA (PAIN POINTS)
- [Identifikasi kendala terbesar mereka saat bicara/karya dan solusinya secara ringkas]

### 4. REKOMENDASI MENTORING
- **Topik Utama:** [Rekomendasikan fokus materi mentoring]
- **Metode Belajar:** [Rekomendasi offline/online/hybrid]
`

    const userPrompt = `
Data Member:
- Nama Lengkap: ${member.full_name}
- Nama Panggung: ${member.stage_name || '-'}
- Pekerjaan: ${member.occupation || '-'}
- Bio: ${member.description || '-'}
- Domisili: ${member.city || '-'}

Data Jawaban Kuesioner:
- Minat Utama: ${interests.primary_interests?.join(', ') || '-'}
- Tingkat Pengalaman: ${interests.experience_level || '-'}
- Goal/Tujuan: ${interests.goals?.join(', ') || '-'}
- Topik Konten Disukai: ${interests.content_topics?.join(', ') || '-'}
- Ketersediaan Waktu: ${interests.availability || '-'}
- Preferensi Belajar: ${interests.learning_preference?.join(', ') || '-'}
- Sumber Info: ${interests.referral_source || '-'}
`

    let aiText = ''

    // 3. Eksekusi panggilan ke LLM
    if (process.env.GEMINI_API_KEY) {
      // Jalankan via Google Gemini API (Pilihan Utama)
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: `${systemPrompt}\n\nBerikut datanya:\n${userPrompt}` }
                ]
              }
            ]
          })
        }
      )

      if (res.ok) {
        const json = await res.json()
        aiText = json.candidates?.[0]?.content?.parts?.[0]?.text || ''
      }
    }

    // Jika Gemini gagal / tidak ada API key, coba gunakan Groq (Fallback)
    if (!aiText && process.env.GROQ_API_KEY) {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
        })
      })

      if (res.ok) {
        const json = await res.json()
        aiText = json.choices?.[0]?.message?.content || ''
      }
    }

    if (!aiText) {
      return NextResponse.json({ error: 'LLM providers failed to analyze profile' }, { status: 500 })
    }

    // 4. Simpan hasil analisis kembali ke DB
    const { error: updateError } = await supabase
      .from('member_interests')
      .update({ ai_analysis: aiText })
      .eq('member_id', member_id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, analysis: aiText })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
