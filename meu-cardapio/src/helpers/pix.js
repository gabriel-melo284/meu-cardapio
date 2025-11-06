// GERA O PAYLOAD DO PIX (COPIA E COLA)
export function generatePixPayload({ chave, valor, nome, cidade, id }) {
  function removeChars(str) {
    return str.replace(/[^a-zA-Z0-9]/g, "");
  }

  function formatTLV(id, value) {
    const size = value.length.toString().padStart(2, "0");
    return `${id}${size}${value}`;
  }

  const gui = formatTLV("00", "BR.GOV.BCB.PIX");
  const chaveTLV = formatTLV("01", chave);
  const nomeTLV = formatTLV("02", nome.substring(0, 25));
  const cidadeTLV = formatTLV("03", cidade.substring(0, 15));
  const txidTLV = formatTLV("05", id);

  const merchantAccountInfo = formatTLV("26", gui + chaveTLV);
  const merchantCategoryCode = formatTLV("52", "0000");
  const transactionCurrency = formatTLV("53", "986"); // BRL
  const transactionAmount = formatTLV("54", valor.toFixed(2));
  const countryCode = formatTLV("58", "BR");
  const merchantName = formatTLV("59", nomeTLV);
  const merchantCity = formatTLV("60", cidadeTLV);
  const additionalData = formatTLV("62", txidTLV);

  // juntando tudo
  let payload =
    "000201" +
    merchantAccountInfo +
    merchantCategoryCode +
    transactionCurrency +
    transactionAmount +
    countryCode +
    merchantName +
    merchantCity +
    additionalData +
    "6304";

  // CRC16 obrigatória
  payload += crc16(payload);

  return payload;
}

// CRC16 DO PIX
function crc16(str) {
  let crc = 0xffff;
  for (let pos = 0; pos < str.length; pos++) {
    crc ^= str.charCodeAt(pos) << 8;
    for (let i = 0; i < 8; i++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).padStart(4, "0").toUpperCase();
}

// GERA O QR CODE EM SVG
export function generateQRCodeSVG(text, size = 300) {
  const qr = require("qrcode-generator")(0, "L");
  qr.addData(text);
  qr.make();
  return qr.createSvgTag({ cellSize: 8, margin: 2 });
}
