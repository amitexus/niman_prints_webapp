
'use client';

import { useMemo, useState } from 'react';
import {
  Search,
  Sparkles,
  Copy,
  Check,
  ArrowRight,
  MessageSquare,
  Megaphone,
  Package,
  Palette,
  ShoppingBag,
  Lightbulb,
  Gift,
  Instagram,
  WandSparkles,
  Bot,
  ChevronRight,
} from 'lucide-react';

import {
  aiTools,
  aiStudioCategories,
  aiStudioBrandContext,
  type AITool,
  type AIToolCategory,
} from '@/lib/ai-studio';

const iconMap = {
  package: Package,
  megaphone: Megaphone,
  instagram: Instagram,
  'message-circle': MessageSquare,
  'shopping-bag': ShoppingBag,
  palette: Palette,
  lightbulb: Lightbulb,
  gift: Gift,
};

const categoryColors: Record<AIToolCategory, string> = {
  Marketing: 'text-sky-400 bg-sky-400/10',
  Sales: 'text-emerald-400 bg-emerald-400/10',
  'Product Content': 'text-violet-400 bg-violet-400/10',
  'Customer Support': 'text-amber-400 bg-amber-400/10',
  Design: 'text-pink-400 bg-pink-400/10',
};

export default function AIStudioPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedTool, setSelectedTool] = useState<AITool | null>(null);
  const [userInput, setUserInput] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [copied, setCopied] = useState(false);

  const filteredTools = useMemo(() => {
    return aiTools.filter((tool) => {
      const matchesCategory =
        selectedCategory === 'All' ||
        tool.category === selectedCategory;

      const matchesSearch = [
        tool.name,
        tool.description,
        tool.category,
      ]
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, search]);

  function chooseTool(tool: AITool) {
    setSelectedTool(tool);
    setUserInput('');
    setGeneratedPrompt('');
    setCopied(false);
  }

  function buildPrompt() {
    if (!selectedTool || !userInput.trim()) return;

    const prompt = `
BUSINESS CONTEXT
Business: ${aiStudioBrandContext.businessName}
Business type: ${aiStudioBrandContext.businessType}
Market: ${aiStudioBrandContext.market}
Currency: ${aiStudioBrandContext.currency}
Primary contact channel: ${aiStudioBrandContext.primaryContactChannel}
Delivery coverage: ${aiStudioBrandContext.deliveryCoverage}

TASK
${selectedTool.instructions}

USER REQUIREMENTS
${userInput.trim()}

IMPORTANT
Use only the facts supplied. Do not invent prices, product specifications, stock availability, delivery promises, discounts or business policies. If important information is missing, identify it clearly.
`.trim();

    setGeneratedPrompt(prompt);
    setCopied(false);
  }

  async function copyPrompt() {
    if (!generatedPrompt) return;

    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  function resetWorkspace() {
    setSelectedTool(null);
    setUserInput('');
    setGeneratedPrompt('');
    setCopied(false);
  }

  return (
    <main className="min-h-screen p-4 md:p-7 lg:p-9">
      <div className="mx-auto max-w-[1500px] space-y-7">

        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs text-muted">
              <span>Business</span>
              <span>/</span>
              <span className="text-white">AI Studio</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-violet-400/10 p-3">
                <Sparkles className="text-violet-400" size={23} />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
                  AI Studio
                </h1>
                <p className="mt-1 text-sm text-muted">
                  Your intelligent creative and business workspace.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start rounded-xl border border-violet-400/20 bg-violet-400/5 px-4 py-2.5">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            <span className="text-xs font-medium text-violet-200">
              Prompt workspace · AI connection pending
            </span>
          </div>
        </header>

        <section className="relative overflow-hidden rounded-2xl border border-violet-400/20 bg-gradient-to-br from-[#211b3b] via-[#17182d] to-[#111521] p-6 md:p-8">
          <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />

          <div className="relative z-10 max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-300/10 px-3 py-1.5 text-xs text-violet-200">
              <WandSparkles size={14} />
              Niman Prints Intelligence Workspace
            </div>

            <h2 className="text-2xl font-semibold leading-tight text-white md:text-3xl">
              Create better content.
              <br />
              Sell smarter. Work faster.
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
              Generate structured prompts for product content, advertising,
              customer conversations and personalized print designs.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() =>
                  document.getElementById('ai-tools')?.scrollIntoView({
                    behavior: 'smooth',
                  })
                }
                className="flex items-center gap-2 rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-400"
              >
                Explore AI tools
                <ArrowRight size={16} />
              </button>
              <span className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-xs text-slate-300">
                <Bot size={15} />
                Business context enabled
              </span>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <div className="surface rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Available tools</span>
              <Sparkles size={18} className="text-violet-400" />
            </div>
            <p className="mt-3 text-2xl font-semibold text-white">
              {aiTools.length}
            </p>
            <p className="mt-1 text-xs text-muted">
              Ready-to-use prompt workflows
            </p>
          </div>

          <div className="surface rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Tool categories</span>
              <Palette size={18} className="text-pink-400" />
            </div>
            <p className="mt-3 text-2xl font-semibold text-white">
              {aiStudioCategories.length}
            </p>
            <p className="mt-1 text-xs text-muted">
              Marketing, sales, content, support and design
            </p>
          </div>

          <div className="surface rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Business profile</span>
              <Bot size={18} className="text-emerald-400" />
            </div>
            <p className="mt-3 text-lg font-semibold text-white">
              {aiStudioBrandContext.businessName}
            </p>
            <p className="mt-1 text-xs text-muted">
              Nepal · NPR · WhatsApp
            </p>
          </div>
        </section>

        <section id="ai-tools" className="space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-white">
              AI tool library
            </h2>
            <p className="mt-1 text-sm text-muted">
              Select a tool to open its dedicated workspace.
            </p>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-xs">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search AI tools..."
                className="w-full rounded-xl border border-line bg-panel py-3 pl-9 pr-3 text-sm text-white outline-none focus:border-accent"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {['All', ...aiStudioCategories].map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
                    selectedCategory === category
                      ? 'bg-accent text-white'
                      : 'bg-panel text-muted hover:text-white'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {filteredTools.map((tool) => {
              const Icon =
                iconMap[tool.icon as keyof typeof iconMap] || Sparkles;

              return (
                <button
                  key={tool.id}
                  onClick={() => chooseTool(tool)}
                  className="surface group rounded-2xl p-5 text-left transition hover:-translate-y-1 hover:border-violet-400/40"
                >
                  <div className="flex items-start justify-between">
                    <div
                      className={`rounded-xl p-3 ${categoryColors[tool.category]}`}
                    >
                      <Icon size={21} />
                    </div>
                    <ChevronRight
                      size={17}
                      className="text-muted transition group-hover:translate-x-1 group-hover:text-white"
                    />
                  </div>

                  <p className="mt-5 font-semibold text-white">
                    {tool.name}
                  </p>

                  <p className="mt-2 min-h-10 text-xs leading-5 text-muted">
                    {tool.description}
                  </p>

                  <div className="mt-5 border-t border-line pt-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${categoryColors[tool.category]}`}
                    >
                      {tool.category}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {filteredTools.length === 0 && (
            <div className="surface rounded-2xl p-10 text-center">
              <Search className="mx-auto text-muted" size={25} />
              <p className="mt-3 text-sm text-white">No matching tools found.</p>
              <p className="mt-1 text-xs text-muted">
                Try another search or category.
              </p>
            </div>
          )}
        </section>

        {selectedTool && (
          <section className="surface scroll-mt-6 overflow-hidden rounded-2xl">
            <div className="flex flex-col justify-between gap-4 border-b border-line p-5 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <div className={`rounded-xl p-3 ${categoryColors[selectedTool.category]}`}>
                  <Sparkles size={20} />
                </div>
                <div>
                  <h2 className="font-semibold text-white">
                    {selectedTool.name}
                  </h2>
                  <p className="mt-1 text-xs text-muted">
                    {selectedTool.description}
                  </p>
                </div>
              </div>

              <button
                onClick={resetWorkspace}
                className="rounded-lg border border-line px-3 py-2 text-xs text-muted hover:bg-white/5 hover:text-white"
              >
                Close workspace
              </button>
            </div>

            <div className="grid gap-6 p-5 lg:grid-cols-2">
              <div className="space-y-5">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-medium text-white">
                      Your requirements
                    </label>
                    <span className="text-xs text-muted">
                      {userInput.length} characters
                    </span>
                  </div>

                  <textarea
                    value={userInput}
                    onChange={(event) => setUserInput(event.target.value)}
                    placeholder={selectedTool.inputPlaceholder}
                    rows={10}
                    className="w-full resize-y rounded-xl border border-line bg-canvas p-4 text-sm leading-6 text-white outline-none placeholder:text-muted/70 focus:border-accent"
                  />
                </div>

                <div className="rounded-xl border border-line bg-white/[0.02] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                    Business context
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-muted">Business</p>
                      <p className="mt-1 text-white">
                        {aiStudioBrandContext.businessName}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted">Market</p>
                      <p className="mt-1 text-white">
                        {aiStudioBrandContext.market}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted">Currency</p>
                      <p className="mt-1 text-white">
                        {aiStudioBrandContext.currency}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted">Contact</p>
                      <p className="mt-1 text-white">
                        {aiStudioBrandContext.primaryContactChannel}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={buildPrompt}
                  disabled={!userInput.trim()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <WandSparkles size={17} />
                  Build AI prompt
                  <ArrowRight size={16} />
                </button>
              </div>

              <div className="flex min-h-[400px] flex-col rounded-xl border border-line bg-canvas p-4">
                <div className="flex items-center justify-between border-b border-line pb-4">
                  <div>
                    <p className="font-semibold text-white">
                      Prompt workspace
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      Your structured AI instructions will appear here.
                    </p>
                  </div>
                  <div className="rounded-lg bg-violet-400/10 p-2">
                    <Bot size={19} className="text-violet-400" />
                  </div>
                </div>

                {generatedPrompt ? (
                  <>
                    <pre className="mt-4 flex-1 whitespace-pre-wrap break-words font-sans text-xs leading-6 text-slate-300">
                      {generatedPrompt}
                    </pre>

                    <button
                      onClick={copyPrompt}
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-violet-400/30 bg-violet-400/10 px-4 py-3 text-sm font-medium text-violet-200 transition hover:bg-violet-400/20"
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                      {copied ? 'Copied successfully' : 'Copy AI prompt'}
                    </button>
                  </>
                ) : (
                  <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-2xl bg-violet-400/10 p-4">
                      <Sparkles size={27} className="text-violet-400" />
                    </div>
                    <p className="mt-4 text-sm font-medium text-white">
                      Ready to create?
                    </p>
                    <p className="mt-2 max-w-xs text-xs leading-5 text-muted">
                      Enter your requirements and click Build AI prompt.
                      Your structured prompt will appear here.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        <section className="rounded-2xl border border-line bg-panel p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-amber-400/10 p-2.5">
              <Bot size={20} className="text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">
                AI integration roadmap
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                The current workspace creates structured prompts locally.
                Next, we will connect a secure backend AI service so tools
                can generate actual content, maintain conversation context
                and use approved Niman Prints business information.
              </p>
              <p className="mt-3 text-xs text-amber-300">
                No AI API key is required for this prototype.
              </p>
            </div>
          </div>
        </section>

        <footer className="pb-3 text-center text-xs text-muted">
          Niman Prints Business OS · AI Studio
        </footer>
      </div>
    </main>
  );
}
