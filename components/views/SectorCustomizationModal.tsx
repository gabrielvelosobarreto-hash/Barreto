"use client"
import { useState, useMemo } from 'react';
import { 
  X, 
  Check, 
  Search, 
  Palette, 
  Sparkles, 
  Package
} from 'lucide-react';
import { 
  SECTOR_COLOR_THEMES, 
  SECTOR_ICONS_LIST, 
  getSectorColorTheme, 
  getSectorIconData 
} from '@/lib/sectorThemeData';

interface SectorCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedColorId: string;
  selectedIconId: string;
  onSelect: (colorId: string, iconId: string) => void;
  sectorNamePreview?: string;
  initialTab?: 'colors' | 'icons';
}

export default function SectorCustomizationModal({
  isOpen,
  onClose,
  selectedColorId,
  selectedIconId,
  onSelect,
  sectorNamePreview = 'Nome do Setor',
  initialTab = 'colors'
}: SectorCustomizationModalProps) {
  const [tempColorId, setTempColorId] = useState(selectedColorId || 'emerald');
  const [tempIconId, setTempIconId] = useState(selectedIconId || 'Utensils');
  const [activeTab, setActiveTab] = useState<'colors' | 'icons'>(initialTab);
  const [iconSearch, setIconSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  if (!isOpen) return null;

  const currentTheme = getSectorColorTheme(tempColorId, tempIconId);
  const currentIconData = getSectorIconData(tempIconId);
  const PreviewIcon = currentIconData.icon || Package;

  const categories = ['Todos', 'Cozinha', 'Cômodos', 'Limpeza', 'Tecnologia', 'Garagem', 'Lazer & Saúde'];

  const filteredIcons = SECTOR_ICONS_LIST.filter(item => {
    const matchesCategory = selectedCategory === 'Todos' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(iconSearch.toLowerCase()) || 
                          item.id.toLowerCase().includes(iconSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleApply = () => {
    onSelect(tempColorId, tempIconId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/80 dark:bg-slate-850/80">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${currentTheme.iconBg} ${currentTheme.iconBorder}`}>
              <Palette className={`w-5 h-5 ${currentTheme.iconText}`} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                Edição
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Escolha a cor temática e o ícone que melhor representam este setor
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Miniature Preview */}
        <div className="px-5 py-3 bg-slate-100/70 dark:bg-slate-950/50 border-b border-slate-200/70 dark:border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shadow-xs transition-colors ${currentTheme.iconBg} ${currentTheme.iconBorder}`}>
              <PreviewIcon className={`w-5 h-5 transition-colors ${currentTheme.iconText}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {sectorNamePreview || 'Meu Setor'}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${currentTheme.iconBg} ${currentTheme.iconBorder} ${currentTheme.iconText}`}>
                  {currentTheme.name.split(' ')[0]}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Ícone: <strong className="text-slate-700 dark:text-slate-300">{currentIconData.name}</strong>
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 shrink-0">
            <div className={`h-3 w-16 sm:w-24 rounded-full ${currentTheme.barBg} shadow-xs`}></div>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-5 pt-2 bg-white dark:bg-slate-900 gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('colors')}
            className={`pb-2.5 px-3.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'colors'
                ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Palette className="w-4 h-4" />
            Menu de Cores ({SECTOR_COLOR_THEMES.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('icons')}
            className={`pb-2.5 px-3.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'icons'
                ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Ícones Variados ({SECTOR_ICONS_LIST.length})
          </button>
        </div>

        {/* Tab 1: Cores */}
        {activeTab === 'colors' && (
          <div className="p-5 overflow-y-auto flex-1 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Selecione a Paleta de Cor do Setor:
              </span>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Cor Selecionada: <strong className={currentTheme.iconText}>{currentTheme.name}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {SECTOR_COLOR_THEMES.map((theme) => {
                const isSelected = tempColorId === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setTempColorId(theme.id)}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all relative group ${
                      isSelected
                        ? 'border-slate-900 dark:border-white ring-2 ring-slate-900/10 dark:ring-white/20 bg-slate-50 dark:bg-slate-800/80 shadow-sm'
                        : 'border-slate-200 dark:border-slate-750 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-850'
                    }`}
                  >
                    <div 
                      className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 shadow-xs transition-transform group-hover:scale-105"
                      style={{ backgroundColor: theme.hex }}
                    >
                      {isSelected && <Check className="w-4 h-4 text-white stroke-[3]" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-bold truncate ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-200'}`}>
                        {theme.name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`w-2 h-2 rounded-full ${theme.dotBg}`}></span>
                        <span className="text-[10px] text-slate-400 uppercase font-medium">{theme.id}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Ícones Variados */}
        {activeTab === 'icons' && (
          <div className="p-5 overflow-y-auto flex-1 space-y-4">
            {/* Search and Category Filter */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={iconSearch}
                  onChange={(e) => setIconSearch(e.target.value)}
                  placeholder="Pesquisar ícones (ex: alimentos, quarto, ferramentas, pet)..."
                  className="w-full pl-10 pr-4 py-2 text-xs font-medium border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                {iconSearch && (
                  <button 
                    type="button" 
                    onClick={() => setIconSearch('')}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Category Pills */}
              <div className="flex gap-1.5 overflow-x-auto pb-1.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
                      selectedCategory === cat
                        ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Icons Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {filteredIcons.map((item) => {
                const IconComp = item.icon;
                const isSelected = tempIconId === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTempIconId(item.id)}
                    className={`p-2.5 rounded-2xl border text-left flex flex-col items-center justify-center gap-2 transition-all relative group ${
                      isSelected
                        ? 'border-emerald-600 dark:border-emerald-400 ring-2 ring-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/40 shadow-xs'
                        : 'border-slate-200 dark:border-slate-750 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-850 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-transform group-hover:scale-110 ${
                      isSelected 
                        ? `${currentTheme.iconBg} ${currentTheme.iconBorder}` 
                        : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                    }`}>
                      <IconComp className={`w-5 h-5 ${isSelected ? currentTheme.iconText : 'text-slate-600 dark:text-slate-300'}`} />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 text-center line-clamp-1">
                      {item.name}
                    </span>
                    {isSelected && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {filteredIcons.length === 0 && (
              <div className="text-center py-8">
                <Package className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-500 dark:text-slate-400">Nenhum ícone encontrado para &ldquo;{iconSearch}&rdquo;</p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-850/90 flex justify-between items-center shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleApply}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm flex items-center gap-1.5 active:scale-95"
            >
              <Check className="w-4 h-4" />
              Aplicar ao Setor
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
