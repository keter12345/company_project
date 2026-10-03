<template>
  <div>
    <el-card class="gpfx-card overview-card">
      <div slot="header" class="header">
        <div>
          <span class="title">最新市场总览</span>
          <el-tag size="mini" type="info" style="margin-left: 8px;">行情时间：{{ marketOverview.source_time || '-' }}</el-tag>
          <el-tag size="mini" type="info" style="margin-left: 6px;">countnum：{{ marketOverview.countnum === null || marketOverview.countnum === undefined ? '-' : marketOverview.countnum }}</el-tag>
          <el-tag size="mini" type="info" style="margin-left: 6px;">分钟序号：{{ marketOverview.market_minute_no === null || marketOverview.market_minute_no === undefined ? '-' : marketOverview.market_minute_no }}</el-tag>
        </div>
        <el-tag size="small" :type="riskTagType">{{ marketOverview.summary && marketOverview.summary.risk_label || '暂无市场数据' }}</el-tag>
      </div>
      <div v-if="marketOverview.summary" class="market-summary">
        <span>全市场：<b class="up-text">上涨 {{ marketOverview.summary.up_count || 0 }}</b> / <b class="down-text">下跌 {{ marketOverview.summary.down_count || 0 }}</b> / 平盘 {{ marketOverview.summary.flat_count || 0 }}</span>
        <span>强势 ≥3%：{{ marketOverview.summary.strong_count || 0 }}，弱势 ≤-3%：{{ marketOverview.summary.weak_count || 0 }}</span>
        <span>累计成交额：{{ yi(marketOverview.summary.tradingamount) }} 亿</span>
        <span>量能：{{ marketOverview.summary.volume_label || '暂无同刻基准' }}（相对昨日同一时刻 {{ ratio(marketOverview.summary.amount_vs_same_time_ratio) }}）</span>
      </div>
      <el-row :gutter="10" v-if="marketCards.length">
        <el-col v-for="market in marketCards" :key="market.market_code" :xs="24" :sm="12" :md="6">
          <div class="market-tile">
            <div class="market-title">{{ market.market_name }}</div>
            <div><b class="up-text">{{ market.up_count || 0 }}</b> 涨 / <b class="down-text">{{ market.down_count || 0 }}</b> 跌 / {{ market.flat_count || 0 }} 平</div>
            <div>成交 {{ yi(market.tradingamount) }} 亿 · {{ market.same_time_volume_label || '暂无同刻基准' }}</div>
            <div>均涨跌 {{ signed(market.weighted_changpercent) }}%</div>
          </div>
        </el-col>
      </el-row>
      <el-empty v-else description="尚未生成市场一分钟数据" :image-size="42" />
    </el-card>

    <el-card class="gpfx-card">
      <div slot="header" class="header">
        <div>
          <span class="title">股票实时提示（新版）</span>
          <el-tag size="mini" :type="isTest ? 'warning' : 'success'" style="margin-left: 8px;">{{ environment }}</el-tag>
          <el-tag size="mini" type="info" style="margin-left: 6px;">展示提示批次：{{ latestCountnum === null ? '-' : latestCountnum }}</el-tag>
          <el-tag size="mini" type="info" style="margin-left: 6px;">当前行情批次：{{ realtimeCountnum === null ? '-' : realtimeCountnum }}</el-tag>
        </div>
        <div class="toolbar">
          <el-switch v-model="isTest" active-text="测试环境" inactive-text="正式环境" />
          <el-input v-model.trim="queryCountnum" clearable size="mini" placeholder="输入任意 countnum" style="width: 165px;" @keyup.enter.native="search" />
          <el-select v-model="ruleCode" clearable size="mini" placeholder="规则" style="width: 230px;">
            <el-option v-for="rule in rules" :key="rule.rule_code" :value="rule.rule_code" :label="`${rule.rule_code} ${rule.rule_name}`" />
          </el-select>
          <el-input-number v-model="limit" size="mini" :min="20" :max="1000" :step="20" controls-position="right" />
          <el-button type="primary" size="mini" @click="search">查询</el-button>
          <el-button size="mini" @click="viewLatest">查看最新</el-button>
          <el-popover placement="bottom-end" width="280" trigger="click">
            <div class="column-setting-title">显示列（勾选增加 / 取消删除）</div>
            <el-checkbox-group v-model="visibleColumnKeys" class="column-setting-list" @change="saveColumnLayout">
              <el-checkbox v-for="column in columnOptions" :key="column.key" :label="column.key">
                {{ column.label }}
              </el-checkbox>
            </el-checkbox-group>
            <div class="column-setting-tip">也可以直接拖动列表表头调整列顺序；设置只保存在当前浏览器。</div>
            <el-button slot="reference" size="mini" icon="el-icon-setting">列设置</el-button>
          </el-popover>
        </div>
      </div>

      <div class="filter-row">
        <el-input v-model="filters.keyword" clearable size="mini" placeholder="代码或名称" style="width: 135px;" />
        <el-select v-model="filters.slotCode" clearable size="mini" placeholder="提示时段" style="width: 125px;">
          <el-option v-for="slot in slotOptions" :key="slot.value" :label="slot.label" :value="slot.value" />
        </el-select>
        <el-select v-model="filters.direction" clearable size="mini" placeholder="方向" style="width: 100px;">
          <el-option label="买入观察" value="long" />
          <el-option label="风险/卖出" value="short" />
          <el-option label="中性" value="neutral" />
        </el-select>
        <el-input-number v-model="filters.minChange" :controls="false" size="mini" placeholder="最低涨幅%" style="width: 108px;" />
        <el-input-number v-model="filters.maxChange" :controls="false" size="mini" placeholder="最高涨幅%" style="width: 108px;" />
        <el-input-number v-model="filters.minAmountYi" :controls="false" :min="0" size="mini" placeholder="最低成交额亿" style="width: 118px;" />
        <el-input-number v-model="filters.minBaselineRatio" :controls="false" :min="0" size="mini" placeholder="最低基准倍数" style="width: 118px;" />
        <el-input-number v-model="filters.minPrevRatio" :controls="false" :min="0" size="mini" placeholder="最低昨额倍数" style="width: 118px;" />
        <el-input v-model="filters.industryKeyword" clearable size="mini" placeholder="行业" style="width: 110px;" />
        <el-input v-model="filters.conceptKeyword" clearable size="mini" placeholder="概念" style="width: 110px;" />
      </div>

      <el-alert
        title="鼠标停在股票代码或名称上，即可查看近 15 日行情、受监控行业/概念的涨停与龙头、公告及已入库资讯。详情按需加载，不参与实时主流程。最终买卖由你确认。"
        type="info" :closable="false" show-icon style="margin-bottom: 12px;" />

      <div class="column-drag-tip">所有列均可点击排序；按住表头左右拖动可调整列顺序。</div>
      <el-table
        ref="alertTable"
        class="alert-result-table"
        :data="displayRows"
        stripe
        size="mini"
        :height="tableHeight"
        style="width: 100%;"
        @sort-change="sortRows"
        @cell-mouse-enter="showStockHover"
        @cell-mouse-leave="scheduleHideStockHover"
      >
        <el-table-column
          v-for="column in visibleColumns"
          :key="column.key"
          :column-key="column.key"
          :prop="column.prop"
          :label="column.label"
          :width="column.width"
          :min-width="column.minWidth"
          :align="column.align || 'left'"
          :sortable="column.sortable ? 'custom' : false"
          :show-overflow-tooltip="column.overflow || false"
          >
          <template slot-scope="scope">
            <template v-if="column.key === 'code' || column.key === 'name'">
              <span class="stock-hover-trigger">{{ columnValue(scope.row, column) }}</span>
            </template>
            <template v-else-if="column.key === 'concept'">
              <span v-if="scope.row.concept_tags && scope.row.concept_tags.length" class="concept-tags">
                <span
                  v-for="tag in scope.row.concept_tags"
                  :key="tag.name"
                  :class="['concept-tag', { 'concept-tag-hot': tag.is_hot }]"
                >{{ tag.name }}</span>
              </span>
              <span v-else>-</span>
            </template>
            <template v-else>{{ columnValue(scope.row, column) }}</template>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <div
      v-if="hoverCard.visible"
      class="stock-hover-card"
      :style="hoverCardStyle"
      @mouseenter="keepStockHoverOpen"
      @mouseleave="scheduleHideStockHover"
    >
      <div class="stock-hover-header">
        <div>
          <b>{{ hoverCard.row.ts_code }} {{ hoverCard.row.ts_name }}</b>
          <span class="stock-hover-time">提示时点 {{ hoverCard.row.signal_time }}</span>
        </div>
        <span class="stock-hover-note">仅展示当前受监控的行业和概念</span>
      </div>
      <div v-if="hoverCard.loading" class="stock-hover-loading">正在加载股票、板块、公告和资讯…</div>
      <div v-else-if="hoverCard.error" class="stock-hover-error">{{ hoverCard.error }}</div>
      <template v-else-if="hoverCard.detail">
        <section class="hover-section daily-chart-section">
          <div class="hover-section-title">近 15 个已收盘交易日 <span>截至 {{ hoverCard.detail.context_date || '-' }}</span><span class="ma5-label">MA5 {{ latestMovingAverage(hoverCard.detail.daily_chart, 5) }}</span><span class="ma15-label">MA15 {{ latestMovingAverage(hoverCard.detail.daily_chart, 15) }}</span></div>
          <div v-if="hoverCard.detail.daily_chart && hoverCard.detail.daily_chart.length" class="daily-chart-wrap">
            <svg class="daily-chart" viewBox="0 0 720 310" preserveAspectRatio="none">
              <line x1="24" y1="54" x2="704" y2="54" class="chart-grid" />
              <line x1="24" y1="115" x2="704" y2="115" class="chart-grid" />
              <line x1="24" y1="176" x2="704" y2="176" class="chart-grid" />
              <line x1="24" y1="256" x2="704" y2="256" class="chart-grid" />
              <text x="2" y="58" class="chart-axis-label">{{ chartPriceMax(hoverCard.detail.daily_chart) }}</text>
              <text x="2" y="178" class="chart-axis-label">{{ chartPriceMin(hoverCard.detail.daily_chart) }}</text>
              <polyline :points="maLinePoints(hoverCard.detail.daily_chart, 5)" fill="none" class="ma5-line" />
              <polyline :points="maLinePoints(hoverCard.detail.daily_chart, 15)" fill="none" class="ma15-line" />
              <g v-for="(day, index) in hoverCard.detail.daily_chart" :key="`${day.rd_datetime}-${index}`">
                <line
                  :x1="chartX(index, hoverCard.detail.daily_chart.length)"
                  :x2="chartX(index, hoverCard.detail.daily_chart.length)"
                  :y1="candleY(day.high, hoverCard.detail.daily_chart)"
                  :y2="candleY(day.low, hoverCard.detail.daily_chart)"
                  :class="candleWickClass(day)"
                />
                <rect
                  :x="chartX(index, hoverCard.detail.daily_chart.length) - chartBarWidth(hoverCard.detail.daily_chart.length) / 2"
                  :y="candleBodyY(day, hoverCard.detail.daily_chart)"
                  :width="chartBarWidth(hoverCard.detail.daily_chart.length)"
                  :height="candleBodyHeight(day, hoverCard.detail.daily_chart)"
                  :class="candleBodyClass(day)"
                >
                  <title>{{ dailyTooltip(day) }}</title>
                </rect>
                <text
                  :x="chartX(index, hoverCard.detail.daily_chart.length)"
                  :y="candleAnnotationY(day, hoverCard.detail.daily_chart, 'change')"
                  text-anchor="middle"
                  :class="candleTextClass(day)"
                >{{ signed(day.changpercent) }}%</text>
                <text
                  :x="chartX(index, hoverCard.detail.daily_chart.length)"
                  :y="candleAnnotationY(day, hoverCard.detail.daily_chart, 'swing')"
                  text-anchor="middle"
                  :class="candleSubTextClass(day)"
                >振{{ swingPercent(day) }}%</text>
                <text
                  v-if="volumeExpansionText(day, index, hoverCard.detail.daily_chart)"
                  :x="chartX(index, hoverCard.detail.daily_chart.length)"
                  :y="candleAnnotationY(day, hoverCard.detail.daily_chart, 'expansion')"
                  text-anchor="middle"
                  :class="candleSubTextClass(day)"
                >{{ volumeExpansionText(day, index, hoverCard.detail.daily_chart) }}</text>
                <rect
                  :x="chartX(index, hoverCard.detail.daily_chart.length) - chartBarWidth(hoverCard.detail.daily_chart.length) / 2"
                  :y="volumeBarY(day, hoverCard.detail.daily_chart)"
                  :width="chartBarWidth(hoverCard.detail.daily_chart.length)"
                  :height="volumeBarHeight(day, hoverCard.detail.daily_chart)"
                  :class="volumeBarClass(day)"
                >
                  <title>{{ dailyTooltip(day) }}</title>
                </rect>
                <text
                  :x="chartX(index, hoverCard.detail.daily_chart.length)"
                  :y="Math.max(191, volumeBarY(day, hoverCard.detail.daily_chart) - 3)"
                  text-anchor="middle"
                  :class="volumeTextClass(day)"
                >{{ yi(day.tradingamount) }}亿</text>
                <text v-if="index % 3 === 0 || index === hoverCard.detail.daily_chart.length - 1" :x="chartX(index, hoverCard.detail.daily_chart.length) - 10" y="280" class="chart-date-label">{{ shortDate(day.rd_datetime) }}</text>
              </g>
            </svg>
            <div class="chart-legend"><span><i class="up-sample" />普通上涨（0%~5%）</span><span><i class="strong-up-sample" />强势上涨（≥5%）</span><span><i class="down-sample" />普通下跌（0%~-5%）</span><span><i class="strong-down-sample" />强势下跌（≤-5%）</span><span><i class="limitup-sample" />涨停</span><span><i class="ma5-sample" />MA5</span><span><i class="ma15-sample" />MA15</span></div>
          </div>
          <div v-else class="hover-empty">没有可展示的已收盘日线。</div>
        </section>

        <div class="hover-plate-grid">
          <section class="hover-section">
            <div class="hover-section-title">受监控行业 <span>{{ hoverCard.detail.industries.length }} 个 · countnum {{ hoverCard.detail.realtime_countnum === null ? '-' : hoverCard.detail.realtime_countnum }}</span></div>
            <div v-if="hoverCard.detail.industries.length" class="plate-list">
              <div v-for="plate in hoverCard.detail.industries" :key="`hy-${plate.bk_code}`" class="plate-item">
                <div><b>{{ plate.bk_name }}</b><span class="plate-metric">涨跌 {{ signed(plate.avg_changpercent) }}%</span><span class="plate-metric">涨停 {{ plate.zt_count || 0 }} 家</span></div>
                <div class="plate-leader">龙头：{{ plate.leader_ts_code || '-' }} {{ plate.leader_ts_name || '-' }} {{ signed(plate.leader_changpercent) }}% {{ plate.leader_limit_display_label || '' }}</div>
                <div v-if="plate.limit_up_stocks && plate.limit_up_stocks.length" class="limit-up-line">涨停：<span v-for="stock in plate.limit_up_stocks" :key="`hy-${plate.bk_code}-${stock.ts_code}`" class="limit-up-chip">{{ stock.ts_code }} {{ stock.ts_name }} {{ stock.limit_display_label || '涨停' }}</span></div>
              </div>
            </div>
            <div v-else class="hover-empty">该股票当前没有受监控行业。</div>
          </section>

          <section class="hover-section">
            <div class="hover-section-title">受监控概念 <span>{{ hoverCard.detail.concepts.length }} 个 · countnum {{ hoverCard.detail.realtime_countnum === null ? '-' : hoverCard.detail.realtime_countnum }}</span></div>
            <div v-if="hoverCard.detail.concepts.length" class="plate-list">
              <div v-for="plate in hoverCard.detail.concepts" :key="`gn-${plate.bk_code}`" :class="['plate-item', { 'plate-item-hot': plate.is_hot }]">
                <div><b>{{ plate.bk_name }}</b><span class="plate-metric">涨跌 {{ signed(plate.avg_changpercent) }}%</span><span class="plate-metric">涨停 {{ plate.zt_count || 0 }} 家</span></div>
                <div class="plate-leader">龙头：{{ plate.leader_ts_code || '-' }} {{ plate.leader_ts_name || '-' }} {{ signed(plate.leader_changpercent) }}% {{ plate.leader_limit_display_label || '' }}</div>
                <div v-if="plate.limit_up_stocks && plate.limit_up_stocks.length" class="limit-up-line">涨停：<span v-for="stock in plate.limit_up_stocks" :key="`gn-${plate.bk_code}-${stock.ts_code}`" class="limit-up-chip">{{ stock.ts_code }} {{ stock.ts_name }} {{ stock.limit_display_label || '涨停' }}</span></div>
              </div>
            </div>
            <div v-else class="hover-empty">该股票当前没有受监控概念。</div>
          </section>
        </div>

        <div class="hover-news-grid">
          <section class="hover-section">
            <div class="hover-section-title">近 30 天相关公告 <span>{{ hoverCard.detail.notices.length }} 条</span></div>
            <div v-if="hoverCard.detail.notices.length" class="event-list">
              <div v-for="(notice, index) in hoverCard.detail.notices" :key="`notice-${index}`" class="event-item">
                <b>{{ shortDate(notice.timekey) }}</b> {{ notice.title || '-' }}
                <div v-if="notice.summary" class="event-summary">{{ notice.summary }}</div>
              </div>
            </div>
            <div v-else class="hover-empty">近 30 天没有已入库公告。</div>
          </section>
          <section class="hover-section">
            <div class="hover-section-title">近 30 天已入库资讯 <span>{{ hoverCard.detail.news.length }} 条</span></div>
            <div v-if="hoverCard.detail.news.length" class="event-list">
              <div v-for="(news, index) in hoverCard.detail.news" :key="`news-${index}`" class="event-item">
                <b>{{ shortDate(news.event_date) }}</b> {{ news.move_type ? `[${news.move_type}]` : '' }} {{ news.title || '-' }}
                <div v-if="news.summary" class="event-summary">{{ news.summary }}</div>
              </div>
            </div>
            <div v-else class="hover-empty">近 30 天没有已入库资讯。</div>
          </section>
        </div>
      </template>
    </div>

    <el-card class="gpfx-card jobs-card">
      <div slot="header"><span class="title-small">提示任务状态（当前表全部）</span></div>
      <el-table :data="jobs" stripe size="mini" max-height="420" @row-click="viewJobAlerts">
        <el-table-column prop="source_time" label="源行情时间" width="170" />
        <el-table-column prop="countnum" label="countnum" width="90" />
        <el-table-column prop="slot_code" label="时段" width="100" />
        <el-table-column prop="status" label="状态" width="100" />
        <el-table-column prop="rule_count" label="规则数" width="80" />
        <el-table-column prop="result_rows" label="命中数" width="80" />
        <el-table-column prop="error_message" label="错误信息" min-width="200" />
        <el-table-column label="提示股票" width="108" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click.stop="viewJobAlerts(scope.row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { getGpfxAlertResults, getGpfxAlertStockHover } from '../../api/stockshow'

export default {
  name: 'GpfxAlertResults',
  data() {
    return {
      isTest: false,
      environment: '正式',
      // latestCountnum 是当前展示的最新实际提示批次；realtimeCountnum 单独展示
      // 行情处理进度，不能用行情批次覆盖提示批次。
      latestCountnum: null,
      realtimeCountnum: null,
      queryCountnum: null,
      queryActive: false,
      activeQuery: null,
      availableCountnums: [],
      marketOverview: { summary: {}, markets: [] },
      ruleCode: '',
      limit: 300,
      filters: {
        keyword: '', slotCode: '', direction: '', minChange: undefined, maxChange: undefined,
        minAmountYi: undefined, minBaselineRatio: undefined, minPrevRatio: undefined,
        industryKeyword: '', conceptKeyword: '',
      },
      slotOptions: [
        { value: 'AUCTION', label: '集合竞价' }, { value: 'OPENING', label: '开盘确认' },
        { value: 'MORNING', label: '上午盘中' }, { value: 'AFTERNOON', label: '下午盘中' },
        { value: 'CLOSING_NEWS', label: '尾盘突发' }, { value: 'CLOSING', label: '14:50 尾盘' },
      ],
      rows: [],
      jobs: [],
      rules: [],
      // 列配置与排序均在浏览器内完成。当前接口最多读取 300 条，不增加数据库排序负担。
      columnOptions: [
        { key: 'time', prop: 'timeText', sortField: 'signal_time', label: '提示时间', width: 88, sortable: true },
        { key: 'countnum', prop: 'countnum', label: '批次', width: 78, align: 'right', sortable: true, defaultVisible: false },
        { key: 'code', prop: 'ts_code', label: '代码', width: 88, sortable: true },
        { key: 'name', prop: 'ts_name', label: '名称', width: 100, sortable: true },
        { key: 'slot', prop: 'slot_code', label: '时段', width: 96, sortable: true, defaultVisible: false },
        { key: 'ruleCode', prop: 'rule_code', label: '规则', width: 72, sortable: true, defaultVisible: false },
        { key: 'ruleName', prop: 'rule_name', label: '规则名称', minWidth: 155, sortable: true, overflow: true, defaultVisible: false },
        { key: 'status', prop: 'signal_status', label: '状态', width: 76, sortable: true, defaultVisible: false },
        { key: 'price', prop: 'priceText', sortField: 'price', label: '价格', width: 82, align: 'right', sortable: true },
        { key: 'change', prop: 'changeText', sortField: 'changpercent', label: '涨跌幅', width: 88, align: 'right', sortable: true },
        { key: 'amount', prop: 'amountText', sortField: 'tradingamount', label: '成交额(亿)', width: 100, align: 'right', sortable: true },
        { key: 'baseline', prop: 'baselineText', sortField: 'amount_vs_baseline', label: '基准倍数', width: 92, align: 'right', sortable: true },
        { key: 'prev', prop: 'prevText', sortField: 'amount_vs_prev_day', label: '昨额倍数', width: 92, align: 'right', sortable: true },
        { key: 'buy', prop: 'buyAmountText', sortField: 'buy_amount', label: '买入额(亿)', width: 100, align: 'right', sortable: true },
        { key: 'sell', prop: 'sellAmountText', sortField: 'sell_amount', label: '卖出额(亿)', width: 100, align: 'right', sortable: true },
        { key: 'industry', prop: 'industry_names', label: '行业', minWidth: 140, sortable: true, overflow: true },
        { key: 'concept', prop: 'concept_names', label: '概念', minWidth: 180, sortable: true, overflow: true },
      ],
      columnOrder: [],
      visibleColumnKeys: [],
      sortState: { key: '', order: '' },
      draggingColumnKey: '',
      timer: null,
      hoverTimer: null,
      hideHoverTimer: null,
      hoverDetailCache: {},
      hoverCard: {
        visible: false, loading: false, error: '', row: {}, detail: null, left: 20, top: 80, key: '',
      },
    }
  },
  computed: {
    tableHeight() { return Math.max(340, window.innerHeight - 560) },
    marketCards() { return (this.marketOverview.markets || []).filter(item => item.market_code !== 'all') },
    riskTagType() {
      const label = (this.marketOverview.summary && this.marketOverview.summary.risk_label) || ''
      if (label.includes('风险')) return 'danger'
      if (label.includes('偏弱')) return 'warning'
      if (label.includes('偏强')) return 'success'
      return 'info'
    },
    formattedRows() {
      const number = (value, digits = 2) => {
        const parsed = Number(value)
        return Number.isFinite(parsed) ? parsed.toFixed(digits) : '-'
      }
      return this.rows.map(row => ({
        ...row,
        timeText: this.timeOnly(row.signal_time),
        priceText: number(row.price),
        changeText: `${number(row.changpercent)}%`,
        amountText: Number.isFinite(Number(row.tradingamount)) ? (Number(row.tradingamount) / 1e8).toFixed(2) : '-',
        baselineText: number(row.amount_vs_baseline),
        prevText: number(row.amount_vs_prev_day),
        buyAmountText: Number.isFinite(Number(row.buy_amount)) ? (Number(row.buy_amount) / 1e8).toFixed(2) : '-',
        sellAmountText: Number.isFinite(Number(row.sell_amount)) ? (Number(row.sell_amount) / 1e8).toFixed(2) : '-',
      }))
    },
    visibleColumns() {
      const options = new Map(this.columnOptions.map(column => [column.key, column]))
      return this.columnOrder
        .filter(key => this.visibleColumnKeys.includes(key) && options.has(key))
        .map(key => options.get(key))
    },
    displayRows() {
      const rows = this.formattedRows.slice()
      const { key, order } = this.sortState
      const column = this.columnOptions.find(item => item.key === key)
      if (!column || !order) return rows
      const field = column.sortField || column.prop
      const direction = order === 'ascending' ? 1 : -1
      return rows.sort((left, right) => this.compareValues(left[field], right[field]) * direction)
    },
    hoverCardStyle() {
      return { left: `${this.hoverCard.left}px`, top: `${this.hoverCard.top}px` }
    },
  },
  mounted() {
    this.restoreColumnLayout()
    this.load()
    // 行情源本身每 5 秒产生一个批次；页面同频刷新即可。
    this.timer = window.setInterval(() => this.load(true, this.queryActive ? this.activeQuery : null), 5000)
    window.addEventListener('resize', this.resize)
  },
  beforeDestroy() {
    window.clearInterval(this.timer)
    window.removeEventListener('resize', this.resize)
  },
  updated() {
    // Element UI 不提供表头换序；仅给当前可见的表头挂原生拖放事件。
    // 这只是浏览器 DOM 操作，不触发数据库查询或实时程序计算。
    this.$nextTick(() => this.bindHeaderDrag())
  },
  methods: {
    resize() { this.$forceUpdate() },
    yi(value) {
      const parsed = Number(value)
      return Number.isFinite(parsed) ? (parsed / 1e8).toFixed(2) : '-'
    },
    ratio(value) {
      const parsed = Number(value)
      return Number.isFinite(parsed) ? `${parsed.toFixed(2)} 倍` : '-'
    },
    signed(value) {
      const parsed = Number(value)
      return Number.isFinite(parsed) ? `${parsed > 0 ? '+' : ''}${parsed.toFixed(2)}` : '-'
    },
    detailText(detail) {
      if (!detail) return '-'
      if (typeof detail === 'string') return detail
      return Object.entries(detail).map(([key, value]) => `${key}=${value}`).join('；')
    },
    timeOnly(value) {
      if (!value) return '-'
      // 接口返回 YYYY-MM-DD HH:MM:SS；列表只保留盘中判断需要的时分秒。
      const matched = String(value).match(/(\d{2}:\d{2}:\d{2})/)
      return matched ? matched[1] : String(value)
    },
    columnValue(row, column) {
      return row[column.prop] === null || row[column.prop] === undefined || row[column.prop] === '' ? '-' : row[column.prop]
    },
    compareValues(left, right) {
      const leftNumber = Number(left)
      const rightNumber = Number(right)
      const leftValidNumber = left !== '' && left !== null && left !== undefined && Number.isFinite(leftNumber)
      const rightValidNumber = right !== '' && right !== null && right !== undefined && Number.isFinite(rightNumber)
      if (leftValidNumber && rightValidNumber) return leftNumber - rightNumber
      return String(left || '').localeCompare(String(right || ''), 'zh-CN', { numeric: true })
    },
    sortRows({ column, prop, order }) {
      const selected = this.columnOptions.find(item => item.key === (column && column.columnKey) || item.prop === prop)
      this.sortState = { key: selected ? selected.key : '', order: order || '' }
    },
    restoreColumnLayout() {
      const defaults = this.columnOptions.map(column => column.key)
      const defaultVisible = this.columnOptions
        .filter(column => column.defaultVisible !== false)
        .map(column => column.key)
      try {
        const saved = JSON.parse(window.localStorage.getItem('gpfx_alert_results_column_layout') || '{}')
        const known = new Set(defaults)
        const order = Array.isArray(saved.order) ? saved.order.filter(key => known.has(key)) : []
        this.columnOrder = [...order, ...defaults.filter(key => !order.includes(key))]
        // 版本3移除了“详情”列，统一改为悬停股票代码或名称展示详情。
        const visible = saved.version === 3 && Array.isArray(saved.visible)
          ? saved.visible.filter(key => known.has(key))
          : defaultVisible
        this.visibleColumnKeys = visible.length ? visible : defaults
      } catch (_) {
        this.columnOrder = defaults
        this.visibleColumnKeys = defaultVisible
      }
    },
    saveColumnLayout() {
      // 至少保留一列，避免误操作后出现无法恢复的空表格。
      if (!this.visibleColumnKeys.length) {
        this.visibleColumnKeys = ['code']
      }
      window.localStorage.setItem('gpfx_alert_results_column_layout', JSON.stringify({
        version: 3,
        order: this.columnOrder,
        visible: this.visibleColumnKeys,
      }))
    },
    bindHeaderDrag() {
      const table = this.$refs.alertTable
      if (!table || !table.$el) return
      const headers = Array.from(table.$el.querySelectorAll('.el-table__header-wrapper thead th'))
        .filter(header => !header.classList.contains('gutter'))
      headers.forEach((header, index) => {
        const column = this.visibleColumns[index]
        if (!column || header.dataset.alertColumnKey === column.key) return
        header.dataset.alertColumnKey = column.key
        header.setAttribute('draggable', 'true')
        header.title = '按住并拖动可调整此列位置'
        header.ondragstart = event => {
          this.draggingColumnKey = column.key
          if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
        }
        header.ondragover = event => event.preventDefault()
        header.ondrop = event => {
          event.preventDefault()
          this.moveColumn(this.draggingColumnKey, column.key)
          this.draggingColumnKey = ''
        }
      })
    },
    moveColumn(sourceKey, targetKey) {
      if (!sourceKey || !targetKey || sourceKey === targetKey) return
      const sourceIndex = this.columnOrder.indexOf(sourceKey)
      const targetIndex = this.columnOrder.indexOf(targetKey)
      if (sourceIndex < 0 || targetIndex < 0) return
      const next = this.columnOrder.slice()
      next.splice(sourceIndex, 1)
      next.splice(targetIndex, 0, sourceKey)
      this.columnOrder = next
      this.saveColumnLayout()
    },
    queryParams() {
      const params = {}
      if (this.queryCountnum !== null && this.queryCountnum !== undefined && this.queryCountnum !== '') params.countnum = this.queryCountnum
      if (this.ruleCode) params.rule_code = this.ruleCode
      if (this.filters.keyword) params.keyword = this.filters.keyword
      if (this.filters.slotCode) params.slot_code = this.filters.slotCode
      if (this.filters.direction) params.direction = this.filters.direction
      if (this.filters.minChange !== undefined && this.filters.minChange !== null) params.min_change = this.filters.minChange
      if (this.filters.maxChange !== undefined && this.filters.maxChange !== null) params.max_change = this.filters.maxChange
      if (this.filters.minAmountYi !== undefined && this.filters.minAmountYi !== null) params.min_amount_yi = this.filters.minAmountYi
      if (this.filters.minBaselineRatio !== undefined && this.filters.minBaselineRatio !== null) params.min_baseline_ratio = this.filters.minBaselineRatio
      if (this.filters.minPrevRatio !== undefined && this.filters.minPrevRatio !== null) params.min_prev_ratio = this.filters.minPrevRatio
      if (this.filters.industryKeyword) params.industry_keyword = this.filters.industryKeyword
      if (this.filters.conceptKeyword) params.concept_keyword = this.filters.conceptKeyword
      return params
    },
    search() {
      // 输入条件不会影响自动刷新；只有明确点击查询才固定这些条件。
      this.activeQuery = this.queryParams()
      this.queryActive = true
      this.load(false, this.activeQuery)
    },
    viewLatest() {
      // 清除已应用的筛选，恢复为“每两秒查询数据库最新 countnum”。
      this.queryCountnum = null
      this.queryActive = false
      this.activeQuery = null
      this.load()
    },
    load(silent = false, appliedQuery = null) {
      const params = { is_test: this.isTest ? 'test_' : '', limit: this.limit, jobs_limit: 5000 }
      Object.assign(params, appliedQuery || {})
      getGpfxAlertResults(params).then(data => {
        if (!data.ok) {
          if (!silent) this.$message.error(data.error || '加载提示结果失败')
          return
        }
        this.environment = data.environment || (this.isTest ? '测试' : '正式')
        this.latestCountnum = data.countnum
        this.realtimeCountnum = data.realtime_countnum
        this.availableCountnums = data.available_countnums || []
        this.marketOverview = data.market_overview || { summary: {}, markets: [] }
        this.rows = data.rows || []
        this.jobs = data.jobs || []
        this.rules = data.rules || []
      }).catch(() => {
        if (!silent) this.$message.error('请求提示结果失败')
      })
    },
    viewJobAlerts(job) {
      if (!job || job.countnum === null || job.countnum === undefined) return
      this.queryCountnum = String(job.countnum)
      this.ruleCode = ''
      this.activeQuery = { countnum: job.countnum }
      this.queryActive = true
      this.load(false, this.activeQuery)
      this.$nextTick(() => window.scrollTo({ top: 0, behavior: 'smooth' }))
    },
    stockHoverKey(row) {
      return `${this.isTest ? 'test' : 'prod'}|${row.ts_code}|${row.signal_time}`
    },
    positionHoverCard(event) {
      const width = 900
      const estimatedHeight = 690
      const viewportWidth = window.innerWidth || 1200
      const viewportHeight = window.innerHeight || 800
      this.hoverCard.left = Math.max(8, Math.min((event.clientX || 20) + 12, viewportWidth - width - 8))
      this.hoverCard.top = Math.max(8, Math.min((event.clientY || 80) + 12, viewportHeight - estimatedHeight - 8))
    },
    showStockHover(row, column, cell, event) {
      if (!column || !['ts_code', 'ts_name'].includes(column.property)) return
      window.clearTimeout(this.hoverTimer)
      window.clearTimeout(this.hideHoverTimer)
      const key = this.stockHoverKey(row)
      this.hoverTimer = window.setTimeout(() => {
        this.positionHoverCard(event || {})
        const cached = this.hoverDetailCache[key]
        this.hoverCard = {
          visible: true,
          loading: !cached,
          error: '',
          row,
          detail: cached || null,
          left: this.hoverCard.left,
          top: this.hoverCard.top,
          key,
        }
        if (!cached) this.loadStockHoverDetail(row, key)
      }, 220)
    },
    scheduleHideStockHover() {
      window.clearTimeout(this.hoverTimer)
      window.clearTimeout(this.hideHoverTimer)
      this.hideHoverTimer = window.setTimeout(() => {
        this.hoverCard.visible = false
      }, 220)
    },
    keepStockHoverOpen() {
      window.clearTimeout(this.hideHoverTimer)
    },
    loadStockHoverDetail(row, key) {
      getGpfxAlertStockHover({
        is_test: this.isTest ? 'test_' : '',
        ts_code: row.ts_code,
        signal_time: row.signal_time,
        countnum: row.countnum,
      }).then(data => {
        if (this.hoverCard.key !== key) return
        if (!data.ok) {
          this.hoverCard.loading = false
          this.hoverCard.error = data.error || '详情读取失败'
          return
        }
        this.hoverDetailCache = { ...this.hoverDetailCache, [key]: data }
        this.hoverCard.loading = false
        this.hoverCard.detail = data
      }).catch(() => {
        if (this.hoverCard.key !== key) return
        this.hoverCard.loading = false
        this.hoverCard.error = '详情读取失败，请稍后再试'
      })
    },
    priceBounds(days) {
      const values = (days || []).flatMap(day => [day.high, day.low, day.open_price, day.close_price])
        .map(value => Number(value)).filter(value => Number.isFinite(value) && value > 0)
      if (!values.length) return { min: 0, max: 1 }
      const min = Math.min(...values)
      const max = Math.max(...values)
      const padding = Math.max((max - min) * 0.06, max * 0.008)
      return { min: min - padding, max: max + padding }
    },
    chartPriceMax(days) {
      const bounds = this.priceBounds(days)
      return Number.isFinite(bounds.max) ? bounds.max.toFixed(2) : '-'
    },
    chartPriceMin(days) {
      const bounds = this.priceBounds(days)
      return Number.isFinite(bounds.min) ? bounds.min.toFixed(2) : '-'
    },
    chartX(index, count) {
      return 28 + ((count <= 1 ? 0.5 : index / (count - 1)) * 672)
    },
    chartBarWidth(count) {
      return Math.max(5, Math.min(22, 520 / Math.max(count, 1)))
    },
    candleY(value, days) {
      const price = Number(value)
      const bounds = this.priceBounds(days)
      if (!Number.isFinite(price)) return 115
      return 176 - ((price - bounds.min) / (bounds.max - bounds.min || 1)) * 122
    },
    isUpDay(day) {
      const open = Number(day.open_price)
      const close = Number(day.close_price)
      return Number.isFinite(open) && Number.isFinite(close) ? close >= open : Number(day.changpercent) >= 0
    },
    limitUpDay(day) {
      const marker = String(day.sf_zt === undefined || day.sf_zt === null ? '' : day.sf_zt).trim().toLowerCase()
      if (marker === '1' || marker === 'true' || marker === '涨停') return true
      const close = Number(day.close_price)
      const limit = Number(day.zt_price)
      return Number.isFinite(close) && Number.isFinite(limit) && limit > 0 && close >= limit * 0.999
    },
    isStrongUpDay(day) { return Number(day.changpercent) >= 5 },
    isStrongDownDay(day) { return Number(day.changpercent) <= -5 },
    candleWickClass(day) {
      if (this.limitUpDay(day)) return 'candle-wick limitup-stroke'
      if (this.isStrongUpDay(day)) return 'candle-wick strong-up-stroke'
      if (this.isStrongDownDay(day)) return 'candle-wick strong-down-stroke'
      return this.isUpDay(day) ? 'candle-wick up-stroke' : 'candle-wick down-stroke'
    },
    candleBodyClass(day) {
      if (this.limitUpDay(day)) return 'candle-body limitup-candle'
      if (this.isStrongUpDay(day)) return 'candle-body strong-up-candle'
      if (this.isStrongDownDay(day)) return 'candle-body strong-down-candle'
      return this.isUpDay(day) ? 'candle-body up-candle' : 'candle-body down-candle'
    },
    volumeBarClass(day) {
      if (this.limitUpDay(day)) return 'amount-bar limitup-fill'
      if (this.isStrongUpDay(day)) return 'amount-bar strong-up-fill'
      if (this.isStrongDownDay(day)) return 'amount-bar strong-down-fill'
      return this.isUpDay(day) ? 'amount-bar up-fill' : 'amount-bar down-fill'
    },
    candleTextClass(day) {
      if (this.limitUpDay(day)) return 'candle-value limitup-text'
      if (this.isStrongUpDay(day)) return 'candle-value strong-up-text'
      if (this.isStrongDownDay(day)) return 'candle-value strong-down-text'
      return this.isUpDay(day) ? 'candle-value up-text' : 'candle-value down-k-text'
    },
    candleSubTextClass(day) {
      return `${this.candleTextClass(day)} candle-sub-value`
    },
    volumeTextClass(day) {
      if (this.limitUpDay(day)) return 'volume-label limitup-text'
      if (this.isStrongUpDay(day)) return 'volume-label strong-up-text'
      if (this.isStrongDownDay(day)) return 'volume-label strong-down-text'
      return this.isUpDay(day) ? 'volume-label up-text' : 'volume-label down-k-text'
    },
    candleBodyY(day, days) {
      return Math.min(this.candleY(day.open_price, days), this.candleY(day.close_price, days))
    },
    candleBodyHeight(day, days) {
      return Math.max(1.5, Math.abs(this.candleY(day.open_price, days) - this.candleY(day.close_price, days)))
    },
    candleAnnotationY(day, days, kind) {
      const offset = { change: 4, swing: 15, expansion: 26 }[kind] || 4
      const minY = { change: 48, swing: 35, expansion: 22 }[kind] || 48
      return Math.max(minY, this.candleY(day.high, days) - offset)
    },
    swingPercent(day) {
      const value = Number(day.swing)
      if (Number.isFinite(value)) return Math.abs(value).toFixed(2)
      const high = Number(day.high)
      const low = Number(day.low)
      const close = Number(day.close_price)
      if (!Number.isFinite(high) || !Number.isFinite(low) || !Number.isFinite(close) || close <= 0) return '-'
      return (((high - low) / close) * 100).toFixed(2)
    },
    volumeExpansionText(day, index, days) {
      if (!index) return ''
      const amount = Number(day.tradingamount)
      const previousAmount = Number(days[index - 1] && days[index - 1].tradingamount)
      const increase = amount - previousAmount
      if (!Number.isFinite(increase) || increase <= 0) return ''
      return `放+${this.yi(increase)}亿`
    },
    movingAverage(days, index, window) {
      if (index + 1 < window) return null
      const values = days.slice(index - window + 1, index + 1).map(day => Number(day.close_price))
      if (values.some(value => !Number.isFinite(value))) return null
      return values.reduce((sum, value) => sum + value, 0) / window
    },
    latestMovingAverage(days, window) {
      const average = this.movingAverage(days || [], (days || []).length - 1, window)
      return average === null ? '-' : average.toFixed(2)
    },
    maLinePoints(days, window) {
      return (days || []).map((day, index) => {
        const average = this.movingAverage(days, index, window)
        return average === null ? null : `${this.chartX(index, days.length)},${this.candleY(average, days)}`
      }).filter(Boolean).join(' ')
    },
    volumeBarHeight(day, days) {
      const amounts = (days || []).map(item => Number(item.tradingamount)).filter(value => Number.isFinite(value) && value > 0)
      const value = Number(day.tradingamount)
      if (!Number.isFinite(value) || value <= 0 || !amounts.length) return 0
      return Math.max(2, (value / Math.max(...amounts)) * 52)
    },
    volumeBarY(day, days) { return 256 - this.volumeBarHeight(day, days) },
    dailyTooltip(day) {
      return `${day.rd_datetime || '-'}\n收盘 ${Number(day.close_price || 0).toFixed(2)}\n涨跌幅 ${this.signed(day.changpercent)}%\n振幅 ${this.swingPercent(day)}%\n成交额 ${this.yi(day.tradingamount)} 亿`
    },
    shortDate(value) {
      const matched = String(value || '').match(/\d{4}-(\d{2}-\d{2})/)
      return matched ? matched[1] : '-'
    },
  },
  watch: {
    isTest() {
      this.ruleCode = ''
      this.queryCountnum = null
      this.queryActive = false
      this.activeQuery = null
      this.load()
    },
  },
}
</script>

<style scoped>
.header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; }
.toolbar { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }
.title { font-size: 16px; font-weight: 600; }
.title-small { font-size: 14px; font-weight: 600; }
.overview-card { margin-bottom: 14px; }
.market-summary { display: flex; flex-wrap: wrap; gap: 14px; margin-bottom: 12px; color: #4b5563; font-size: 13px; }
.market-tile { min-height: 86px; margin-bottom: 10px; padding: 10px 12px; border: 1px solid #e6eaf0; border-radius: 4px; color: #5b6472; font-size: 12px; line-height: 1.8; }
.market-title { color: #303133; font-weight: 600; font-size: 14px; }
.up-text { color: #e53935; }
.down-text { color: #1e88e5; }
.filter-row { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin: 0 0 12px; }
.column-drag-tip { margin: 0 0 8px; color: #909399; font-size: 12px; }
.column-setting-title { margin-bottom: 8px; color: #303133; font-weight: 600; font-size: 13px; }
.column-setting-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 7px 10px; }
.column-setting-list .el-checkbox { margin-right: 0; }
.column-setting-tip { margin-top: 10px; color: #909399; font-size: 12px; line-height: 1.5; }
.alert-result-table >>> .el-table__header th { cursor: grab; user-select: none; }
.alert-result-table >>> .el-table__header th:active { cursor: grabbing; }
.stock-hover-trigger { display: inline-block; cursor: help; border-bottom: 1px dashed #909399; }
.concept-tags { display: flex; flex-wrap: wrap; gap: 3px 6px; line-height: 1.55; white-space: normal; }
.concept-tag { color: #606266; }
.concept-tag-hot { color: #e53935; font-weight: 600; }
.stock-hover-card { position: fixed; z-index: 3000; width: 1600px; max-width: calc(100vw - 1vw); max-height: calc(100vh - 2vh); overflow-y: auto; padding: 16px; box-sizing: border-box; background: #fff; border: 1px solid #dcdfe6; border-radius: 6px; box-shadow: 0 8px 26px rgba(0, 0, 0, .22); color: #303133; font-size: 12px; }
.stock-hover-header { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; padding-bottom: 9px; border-bottom: 1px solid #ebeef5; font-size: 14px; }
.stock-hover-time, .stock-hover-note, .hover-section-title span { margin-left: 8px; color: #909399; font-size: 12px; font-weight: normal; }
.hover-section-title .ma5-label { color: #d9a406; }
.hover-section-title .ma15-label { color: #d84f74; }
.stock-hover-loading, .stock-hover-error, .hover-empty { padding: 14px 4px; color: #909399; }
.stock-hover-error { color: #f56c6c; }
.hover-section { margin-top: 12px; padding: 10px; border: 1px solid #ebeef5; border-radius: 4px; }
.hover-section-title { margin-bottom: 8px; font-weight: 600; color: #303133; }
.daily-chart-section { margin-top: 12px; }
.daily-chart { display: block; width: 100%; height: 300px; overflow: visible; }
.chart-grid { stroke: #ebeef5; stroke-width: 1; }
.chart-axis-label, .chart-date-label { fill: #909399; font-size: 10px; }
.candle-wick { stroke-width: 1.2; }
.candle-body { stroke-width: 1.25; }
.up-candle { fill: #fff; stroke: #e53935; }
.down-candle { fill: #dff3e5; stroke: #27914d; }
.strong-up-candle { fill: #cf2d2d; stroke: #b71f1f; }
.strong-down-candle { fill: #168443; stroke: #0f6632; }
.limitup-candle { fill: #d99b19; stroke: #bd7f00; }
.up-stroke { stroke: #e53935; }
.down-stroke { stroke: #27914d; }
.strong-up-stroke { stroke: #b71f1f; }
.strong-down-stroke { stroke: #0f6632; }
.limitup-stroke { stroke: #bd7f00; }
.ma5-line { stroke: #d9a406; stroke-width: 1.8; }
.ma15-line { stroke: #d84f74; stroke-width: 1.8; }
.amount-bar { opacity: .82; }
.up-fill { fill: #e53935; }
.down-fill { fill: #59a975; }
.strong-up-fill { fill: #b71f1f; }
.strong-down-fill { fill: #0f6632; }
.limitup-fill { fill: #d99b19; }
.candle-value, .volume-label { font-size: 8.5px; font-weight: 600; }
.candle-sub-value { font-size: 7.5px; font-weight: 500; opacity: .88; }
.candle-value.up-text, .volume-label.up-text { fill: #e53935; }
.down-k-text { fill: #27914d; }
.strong-up-text { fill: #b71f1f; }
.strong-down-text { fill: #0f6632; }
.limitup-text { fill: #bd7f00; }
.chart-legend { display: flex; gap: 16px; color: #606266; font-size: 11px; }
.chart-legend i { display: inline-block; width: 12px; height: 8px; margin-right: 4px; vertical-align: middle; }
.up-sample { background: #e53935; }
.strong-up-sample { background: #b71f1f; }
.down-sample { background: #59a975; }
.strong-down-sample { background: #0f6632; }
.limitup-sample { background: #d99b19; }
.ma5-sample { height: 2px !important; background: #d9a406; }
.ma15-sample { height: 2px !important; background: #d84f74; }
.hover-plate-grid, .hover-news-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.plate-list, .event-list { display: grid; gap: 8px; }
.plate-item, .event-item { padding-bottom: 7px; border-bottom: 1px dashed #ebeef5; line-height: 1.55; }
.plate-item:last-child, .event-item:last-child { padding-bottom: 0; border-bottom: 0; }
.plate-item-hot > div:first-child, .plate-item-hot > div:first-child b, .plate-item-hot > div:first-child .plate-metric { color: #e53935; font-weight: 600; }
.plate-metric { margin-left: 8px; color: #606266; }
.plate-leader { color: #606266; }
.limit-up-line { color: #e53935; }
.limit-up-chip { display: inline-block; margin: 2px 4px 0 0; padding: 0 4px; border-radius: 3px; background: #fff1f0; }
.event-summary { max-height: 36px; overflow: hidden; color: #909399; }
@media (max-width: 900px) { .stock-hover-card { width: calc(100vw - 16px); } .hover-plate-grid, .hover-news-grid { grid-template-columns: 1fr; } }
.jobs-card { margin-top: 14px; }
.detail-line { line-height: 1.7; word-break: break-all; }
</style>
