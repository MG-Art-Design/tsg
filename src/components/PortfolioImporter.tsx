import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FileArrowUp, X, CheckCircle, WarningCircle, Info } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { formatCurrency, formatPercent, INITIAL_PORTFOLIO_VALUE } from '@/lib/helpers'

interface ImportedPosition {
  symbol: string
  name: string
  type: 'stock' | 'crypto'
  allocation: number
  originalValue?: number
  shares?: number
}

interface PortfolioImporterProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (positions: Array<{ symbol: string; name: string; type: 'stock' | 'crypto'; allocation: number }>, portfolioName: string) => void
}

export function PortfolioImporter({ open, onOpenChange, onImport }: PortfolioImporterProps) {
  const [portfolioName, setPortfolioName] = useState('')
  const [rawPositions, setRawPositions] = useState<ImportedPosition[]>([])
  const [normalizedPositions, setNormalizedPositions] = useState<ImportedPosition[]>([])
  const [originalTotal, setOriginalTotal] = useState(0)
  const [step, setStep] = useState<'upload' | 'preview'>('upload')
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleReset = () => {
    setPortfolioName('')
    setRawPositions([])
    setNormalizedPositions([])
    setOriginalTotal(0)
    setStep('upload')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClose = () => {
    handleReset()
    onOpenChange(false)
  }

  const detectAssetType = (symbol: string, name: string): 'stock' | 'crypto' => {
    const cryptoSymbols = ['BTC', 'ETH', 'USDT', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'AVAX', 'MATIC', 'DOT', 'LINK', 'UNI', 'ATOM', 'LTC', 'BCH', 'XLM', 'ALGO', 'VET', 'FIL']
    const cryptoKeywords = ['bitcoin', 'ethereum', 'crypto', 'coin', 'token']
    
    if (cryptoSymbols.includes(symbol.toUpperCase())) {
      return 'crypto'
    }
    
    const lowerName = name.toLowerCase()
    if (cryptoKeywords.some(keyword => lowerName.includes(keyword))) {
      return 'crypto'
    }
    
    return 'stock'
  }

  const parseCSV = (text: string): ImportedPosition[] => {
    const lines = text.trim().split('\n')
    if (lines.length < 2) {
      throw new Error('CSV file must contain at least a header row and one data row')
    }

    const header = lines[0].toLowerCase().split(',').map(h => h.trim())
    const symbolIndex = header.findIndex(h => h.includes('symbol') || h.includes('ticker'))
    const nameIndex = header.findIndex(h => h.includes('name') || h.includes('company'))
    const allocationIndex = header.findIndex(h => h.includes('allocation') || h.includes('percent') || h.includes('%'))
    const valueIndex = header.findIndex(h => h.includes('value') || h.includes('amount') || h.includes('worth'))
    const sharesIndex = header.findIndex(h => h.includes('shares') || h.includes('quantity') || h.includes('units'))
    const typeIndex = header.findIndex(h => h.includes('type') || h.includes('asset'))

    if (symbolIndex === -1) {
      throw new Error('CSV must contain a "symbol" or "ticker" column')
    }

    const positions: ImportedPosition[] = []
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      const values = line.split(',').map(v => v.trim().replace(/["']/g, ''))
      
      const symbol = values[symbolIndex]?.toUpperCase() || ''
      if (!symbol) continue

      const name = nameIndex !== -1 ? values[nameIndex] : symbol
      let allocation = 0
      let originalValue = 0

      if (allocationIndex !== -1) {
        const allocStr = values[allocationIndex].replace('%', '')
        allocation = parseFloat(allocStr) || 0
      }

      if (valueIndex !== -1) {
        const valueStr = values[valueIndex].replace(/[$,]/g, '')
        originalValue = parseFloat(valueStr) || 0
      }

      let shares = 0
      if (sharesIndex !== -1) {
        shares = parseFloat(values[sharesIndex]) || 0
      }

      let type: 'stock' | 'crypto' = 'stock'
      if (typeIndex !== -1) {
        const typeValue = values[typeIndex].toLowerCase()
        type = typeValue.includes('crypto') ? 'crypto' : 'stock'
      } else {
        type = detectAssetType(symbol, name)
      }

      positions.push({
        symbol,
        name,
        type,
        allocation,
        originalValue,
        shares
      })
    }

    return positions
  }

  const normalizePositions = (positions: ImportedPosition[]): { normalized: ImportedPosition[], total: number } => {
    let total = 0
    let hasAllocations = false

    for (const pos of positions) {
      if (pos.allocation > 0) {
        hasAllocations = true
        total += pos.allocation
      } else if ((pos.originalValue || 0) > 0) {
        total += (pos.originalValue || 0)
      }
    }

    if (total === 0) {
      throw new Error('Unable to determine portfolio values. Ensure your CSV includes "allocation" (%) or "value" ($) columns.')
    }

    const normalized: ImportedPosition[] = positions.map(pos => {
      let newAllocation: number
      
      if (hasAllocations) {
        newAllocation = (pos.allocation / total) * 100
      } else {
        newAllocation = ((pos.originalValue || 0) / total) * 100
      }

      return {
        ...pos,
        allocation: parseFloat(newAllocation.toFixed(2))
      }
    })

    const normalizedTotal = normalized.reduce((sum, p) => sum + p.allocation, 0)
    if (Math.abs(normalizedTotal - 100) > 0.5) {
      const adjustment = (100 - normalizedTotal) / normalized.length
      normalized.forEach(p => {
        p.allocation = parseFloat((p.allocation + adjustment).toFixed(2))
      })
    }

    return { normalized, total: hasAllocations ? (total / 100) * INITIAL_PORTFOLIO_VALUE : total }
  }

  const handleFileUpload = async (file: File) => {
    try {
      const text = await file.text()
      const positions = parseCSV(text)

      if (positions.length === 0) {
        toast.error('No valid positions found in CSV')
        return
      }

      const { normalized, total } = normalizePositions(positions)
      
      setRawPositions(positions)
      setNormalizedPositions(normalized)
      setOriginalTotal(total)
      setStep('preview')

      const fileName = file.name.replace('.csv', '')
      setPortfolioName(fileName.charAt(0).toUpperCase() + fileName.slice(1))

    } catch (error) {
      console.error('Import error:', error)
      toast.error('Import failed', {
        description: error instanceof Error ? error.message : 'Failed to parse CSV file'
      })
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const file = e.dataTransfer.files?.[0]
    if (file && file.name.endsWith('.csv')) {
      handleFileUpload(file)
    } else {
      toast.error('Please upload a CSV file')
    }
  }

  const handleImport = () => {
    if (!portfolioName.trim()) {
      toast.error('Please enter a portfolio name')
      return
    }

    if (normalizedPositions.length === 0) {
      toast.error('No positions to import')
      return
    }

    const positions = normalizedPositions.map(p => ({
      symbol: p.symbol,
      name: p.name,
      type: p.type,
      allocation: p.allocation
    }))

    onImport(positions, portfolioName)
    handleClose()
    
    const totalValue = formatCurrency(INITIAL_PORTFOLIO_VALUE)
    toast.success('Portfolio imported!', {
      description: `"${portfolioName}" with ${positions.length} positions has been created and normalized to ${totalValue}.`
    })
  }

  const handleRemovePosition = (index: number) => {
    const updated = normalizedPositions.filter((_, i) => i !== index)
    const { normalized } = normalizePositions(updated.map(p => ({
      ...p,
      originalValue: (p.allocation / 100) * INITIAL_PORTFOLIO_VALUE
    })))
    setNormalizedPositions(normalized)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileArrowUp weight="fill" className="text-[oklch(0.70_0.14_75)]" />
            Import Portfolio
          </DialogTitle>
          <DialogDescription>
            Upload a CSV file to import your portfolio positions. We'll automatically normalize the values to {formatCurrency(INITIAL_PORTFOLIO_VALUE)}.
          </DialogDescription>
        </DialogHeader>

        {step === 'upload' && (
          <div className="space-y-4 py-4">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-[oklch(0.70_0.14_75)] bg-[oklch(0.70_0.14_75_/_0.1)]'
                  : 'border-border hover:border-[oklch(0.70_0.14_75_/_0.5)]'
              }`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
            >
              <FileArrowUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-semibold mb-2">Drop your CSV file here</p>
              <p className="text-sm text-muted-foreground mb-4">or</p>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                Browse Files
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-semibold">CSV Format Requirements:</p>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Must include a <strong>Symbol</strong> or <strong>Ticker</strong> column</li>
                    <li>Should include either <strong>Allocation</strong> (%) or <strong>Value</strong> ($) column</li>
                    <li>Optional: Name, Type (stock/crypto), Shares columns</li>
                  </ul>
                  <p className="text-sm mt-2">Example:</p>
                  <code className="block text-xs bg-muted p-2 rounded mt-1">
                    Symbol,Name,Allocation<br />
                    AAPL,Apple Inc.,30<br />
                    TSLA,Tesla Inc.,25<br />
                    BTC,Bitcoin,45
                  </code>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="import-portfolio-name">Portfolio Name</Label>
              <Input
                id="import-portfolio-name"
                placeholder="Enter portfolio name"
                value={portfolioName}
                onChange={(e) => setPortfolioName(e.target.value)}
              />
            </div>

            {originalTotal !== INITIAL_PORTFOLIO_VALUE && (
              <Alert>
                <WarningCircle className="h-4 w-4" />
                <AlertDescription>
                  Your portfolio total of <strong>{formatCurrency(originalTotal)}</strong> will be normalized to <strong>{formatCurrency(INITIAL_PORTFOLIO_VALUE)}</strong> while maintaining the same percentage allocations.
                </AlertDescription>
              </Alert>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Positions ({normalizedPositions.length})</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep('upload')}
                >
                  Upload Different File
                </Button>
              </div>

              <Card>
                <CardContent className="p-0">
                  <div className="max-h-96 overflow-y-auto">
                    <table className="w-full">
                      <thead className="bg-muted sticky top-0">
                        <tr>
                          <th className="text-left p-3 text-sm font-semibold">Symbol</th>
                          <th className="text-left p-3 text-sm font-semibold">Name</th>
                          <th className="text-left p-3 text-sm font-semibold">Type</th>
                          <th className="text-right p-3 text-sm font-semibold">Allocation</th>
                          <th className="text-right p-3 text-sm font-semibold">Value</th>
                          <th className="w-8"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {normalizedPositions.map((position, index) => (
                          <tr key={index} className="border-t border-border">
                            <td className="p-3">
                              <span className="font-mono font-semibold">{position.symbol}</span>
                            </td>
                            <td className="p-3 text-sm">{position.name}</td>
                            <td className="p-3">
                              <Badge variant={position.type === 'crypto' ? 'default' : 'secondary'}>
                                {position.type}
                              </Badge>
                            </td>
                            <td className="p-3 text-right font-semibold">
                              {formatPercent(position.allocation)}
                            </td>
                            <td className="p-3 text-right text-[oklch(0.70_0.14_75)]">
                              {formatCurrency((position.allocation / 100) * INITIAL_PORTFOLIO_VALUE)}
                            </td>
                            <td className="p-3">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                onClick={() => handleRemovePosition(index)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-muted font-semibold">
                        <tr>
                          <td colSpan={3} className="p-3 text-right">Total:</td>
                          <td className="p-3 text-right">
                            {formatPercent(normalizedPositions.reduce((sum, p) => sum + p.allocation, 0))}
                          </td>
                          <td className="p-3 text-right text-[oklch(0.70_0.14_75)]">
                            {formatCurrency(INITIAL_PORTFOLIO_VALUE)}
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {step === 'preview' && (
            <Button onClick={handleImport} className="flex items-center gap-2">
              <CheckCircle weight="fill" />
              Import Portfolio
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
