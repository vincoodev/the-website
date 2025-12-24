/**
 * REGEX PENJELASAN:
 * Mengambil angka bulat, desimal, maupun notasi ilmiah (e.g. 1.2e-4).
 * Ini krusial agar tidak ada angka yang terlewat saat proses pencarian koordinat.
 */
const NUMBER_REGEX = /-?\d*\.\d+(?:[eE][]?\d+)?/g;

const NUMBER_REGEX2 = /-?\d*\.?\d+(?:[eE][]?\d+)?/g;



/**
 * KONFIGURASI TARGET:
 * Daftar elemen SVG dan atributnya yang mengandung angka koordinat atau dimensi.
 * Kita memproses ini untuk memperluas kapasitas penyimpanan data.
 */
const TARGETS = {
  'path': ['d'],
  'circle': ['cx', 'cy', 'r'],
  'ellipse': ['cx', 'cy', 'rx', 'ry'],
  'rect': ['x', 'y', 'width', 'height', 'rx', 'ry'],
  'line': ['x1', 'y1', 'x2', 'y2'],
  'polyline': ['points'],
  'polygon': ['points']
};



/**
 * ALUR ENCODE PESAN KE BIT:
 * 1. Setiap karakter diubah ke kode ASCII (Uint8).
 * 2. Kode ASCII diubah ke string biner 8-bit (padStart 8 '0').
 * 3. Menambahkan '00000000' (Null Terminator) sebagai penanda akhir pesan.
 */
export const messageToBits = (msg) => {
  return msg.split('').map(char => 
    char.charCodeAt(0).toString(2).padStart(8, '0')
  ).join('') + '00000000'; 
};



/**
 * ALUR DECODE BIT KE PESAN:
 * 1. Memotong setiap 8-bit.
 * 2. Jika bit bernilai 0 semua (null), berhenti membaca.
 * 3. Mengubah biner kembali ke karakter teks.
 */
export const bitsToMessage = (bits) => {
  let msg = '';
  for (let i = 0; i < bits.length; i += 8) {
    const byte = bits.slice(i, i + 8);
    if (byte === '00000000' || byte.length < 8) break;
    msg += String.fromCharCode(parseInt(byte, 2));
  }
  return msg;
};



// DAFTAR HITAM: Jangan pernah sentuh atribut ini!
// Mengubah angka di viewBox atau version bisa membuat gambar hilang/error.
const BLACKLIST_ATTRS = ['viewBox', 'version', 'stroke-width', 'opacity', 'xmlns', 'fill', 'stroke', 'encoding'];



/**
 * TRAVERSAL DOM (URUTAN DETERMINISTIK):
 * Fungsi ini memastikan kita memindai elemen SVG dengan urutan yang sama
 * baik saat menyisipkan maupun saat membaca. Jika urutan berubah, data akan hancur.
 */
function walkElements(document, callback = (el, attr) => {}) {
  const allElements = document.querySelectorAll('*');
  allElements.forEach(el => {
    const tagName = el.tagName.toLowerCase();
    
    // Pastikan tag ini ada dalam target kita
    if (TARGETS[tagName]) {
      TARGETS[tagName].forEach(attrName => {
        // Cek apakah atribut ada dan TIDAK masuk dalam blacklist
        if (el.hasAttribute(attrName) && !BLACKLIST_ATTRS.includes(attrName)) {
          callback(el, attrName);
        }
      });
    }
  });
}


export function capacityCheck(document){
    let totalSlots = 0;
    walkElements(document, (el, attr) => {
        const val = el.getAttribute(attr) || '';
        const matches = val.match(attr ==  'd' ? NUMBER_REGEX : NUMBER_REGEX2);
        if (matches) totalSlots += matches.length;
    });
    return totalSlots
}


export function hideInUniversal(svgRaw, message) {
  const document = svgRaw

  // 1. Persiapkan data biner
  const bits = messageToBits(message);
  let bitIndex = 0;

  // 2. Cek Kapasitas: Menghitung berapa banyak angka yang ada di seluruh file
  let totalSlots = capacityCheck

  console.log(`📊 Statistik: Tersedia ${totalSlots} slot | Dibutuhkan ${bits.length} bit.`);

  // Validasi: Jika bit pesan lebih banyak dari koordinat, hentikan proses.
  if (bits.length > totalSlots) {
    console.error("❌ Error: Ukuran pesan melebihi kapasitas koordinat SVG ini.");
    return;
  }

  // 3. Proses Injeksi (Least Significant Decimal):
  walkElements(document, (el, attr) => {
    const val = el.getAttribute(attr) || '';
    
    // Ganti setiap angka dengan angka baru yang sudah disisipi bit
    const newVal = val.replace(attr ==  'd' ? NUMBER_REGEX : NUMBER_REGEX2, (match) => {
      if (bitIndex < bits.length) {
        const bit = bits[bitIndex++];
        const num = parseFloat(match);

        // Paksa presisi ke 3 desimal (e.g. 10.5 -> "10.500")
        const formatted = num.toFixed(3);

        // Ganti digit terakhir (indeks ke-3 setelah titik) dengan bit pesan
        // Contoh: "10.500" jadi "10.501" jika bit adalah 1
        return formatted.substring(0, formatted.length - 1) + bit;
      }
      return match; // Jika pesan sudah habis, biarkan sisa angka apa adanya
    });
    
    el.setAttribute(attr, newVal);
  });

    const serializer = new XMLSerializer()

    return serializer.serializeToString(document)
}



export function revealFromUniversal(svgRaw) {
  const document = svgRaw

  let bits = "";

  // 1. Ekstraksi: Mengikuti urutan elemen yang sama persis dengan saat Encode
  walkElements(document, (el, attr) => {
    const val = el.getAttribute(attr) || '';
    const numbers = val.match(attr == 'd' ? NUMBER_REGEX : NUMBER_REGEX2);
    
    if (numbers) {
      numbers.forEach(num => {
        // Ambil kembali digit terakhir dari setiap angka
        const formatted = parseFloat(num).toFixed(3);

        const lastDigit = formatted[formatted.length - 1];

        // Masukkan ke dalam rangkaian bit
        bits += (lastDigit === '1' ? '1' : '0');
      });
    }
  });

  // 2. Terjemahkan bitstream kembali menjadi teks manusia
  return bitsToMessage(bits);
}