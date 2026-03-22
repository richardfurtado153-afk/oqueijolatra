export async function calculateShipping(cepDestino: string, weightGrams: number) {
  try {
    const { calcularPrecoPrazo } = await import('correios-brasil')
    const args = {
      sCepOrigem: '01310100',
      sCepDestino: cepDestino.replace(/\D/g, ''),
      nVlPeso: String(weightGrams / 1000),
      nCdFormato: '1',
      nVlComprimento: '20',
      nVlAltura: '15',
      nVlLargura: '15',
      nVlDiametro: '0',
      nCdServico: ['04510', '04014'],
      nVlValorDeclarado: '0',
    }
    const result = await calcularPrecoPrazo(args)
    const options = result
      .filter((r: any) => r.Erro === '0')
      .map((r: any) => ({
        method: r.Codigo === '04510' ? 'PAC' : 'SEDEX',
        price: parseFloat(r.Valor.replace(',', '.')),
        days: parseInt(r.PrazoEntrega),
      }))

    // Fallback: if Correios API returns no valid options, use hardcoded estimates
    if (options.length === 0) {
      return getFallbackShipping()
    }

    return options
  } catch {
    // Fallback when Correios API is unavailable
    return getFallbackShipping()
  }
}

function getFallbackShipping() {
  return [
    { method: 'PAC', price: 24.9, days: 8 },
    { method: 'SEDEX', price: 42.9, days: 3 },
  ]
}
