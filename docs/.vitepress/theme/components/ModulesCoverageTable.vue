<script setup>
import { computed, onMounted, ref } from 'vue';
import featuresData from '../../../roadmap/features.json';
import { getModuleCoverage } from '../utils';

const searchQuery = ref('');
const selectedStatus = ref('all');
const globalClassQuery = ref('');
const selectedClassStatus = ref('all');

const statusFilters = [
  { key: 'all', label: 'All' },
  { key: 'available', label: 'Available' },
  { key: 'partially-implemented', label: 'Partial' },
  { key: 'na', label: 'Unavailable' },
  { key: 'other', label: 'Other' },
];

const classStatusFilters = [
  { key: 'all', label: 'All classes' },
  { key: 'auto', label: 'Auto' },
  { key: 'manual', label: 'Manual' },
  { key: 'ignore', label: 'Ignore' },
];

const availableModules = computed(() => {
  const entries = Object.entries(featuresData.moduleStatus?.available || {})
  return entries
    .map(([module, item]) => ({ module, ...item }))
    .sort((a, b) => a.module.localeCompare(b.module))
});

function getRowStatusKey(row) {
  if (row?.status === 'na') {
    return 'na';
  }
  if (row?.status === 'available') {
    return 'available';
  }
  if (row?.status === 'partially-implemented') {
    return 'partially-implemented';
  }
  if (row?.status === 'na' || isNotApplicable(row?.version)) {
    return 'na';
  }
  return 'other';
}

const statusCounts = computed(() => {
  const counts = new Map(statusFilters.map((status) => [status.key, 0]));

  allModuleRows.value.forEach((row) => {
    const statusKey = getRowStatusKey(row);
    counts.set(statusKey, (counts.get(statusKey) || 0) + 1);
  });

  counts.set('all', allModuleRows.value.length);
  return counts;
});

const allModuleRows = computed(() => {
  const unavailableRows = (featuresData.moduleStatus?.unavailable || []).map((module) => ({
    module,
    status: 'na',
    version: '—',
  }));

  return [...availableModules.value, ...unavailableRows].sort((a, b) => a.module.localeCompare(b.module));
});

const filteredModuleRows = computed(() => {
  const normalizedQuery = searchQuery.value.trim().toLowerCase();
  const classFiltersActive =
    globalClassQuery.value.trim().length > 0 || selectedClassStatus.value !== 'all';

  return allModuleRows.value.filter((row) => {
    const matchesSearch = !normalizedQuery || row.module.toLowerCase().includes(normalizedQuery);
    const matchesStatus =
      selectedStatus.value === 'all' || getRowStatusKey(row) === selectedStatus.value;
    const matchesClassFilters =
      !classFiltersActive || getVisibleClassEntries(row.module).length > 0;

    return matchesSearch && matchesStatus && matchesClassFilters;
  });
});

const hasActiveFilters = computed(() => {
  return searchQuery.value.trim().length > 0
    || selectedStatus.value !== 'all'
    || globalClassQuery.value.trim().length > 0
    || selectedClassStatus.value !== 'all';
});

function getModuleGroupName(moduleName) {
  const moduleId = String(moduleName || '').split('::')[1] || '';
  if (!moduleId) {
    return 'Other';
  }
  // These two have an uppercase character in the group name, so we need to check them first
  if (moduleId.startsWith('GeoVis')) {
    return 'GeoVis';
  }
  if (moduleId.startsWith('IO')) {
    return 'IO';
  }

  const match = moduleId.match(/^[A-Z][a-z]*/);
  return match ? match[0] : 'Other';
}

const moduleGroups = computed(() => {
  const groups = new Map();

  filteredModuleRows.value.forEach((row) => {
    const groupName = getModuleGroupName(row.module);
    if (!groups.has(groupName)) {
      groups.set(groupName, []);
    }
    groups.get(groupName).push(row);
  });

  return Array.from(groups.entries())
    .map(([name, rows]) => ({ name, rows }))
    .sort((a, b) => a.name.localeCompare(b.name));
});

const moduleCoverage = ref(new Map());
const openClassListPopoverFor = ref(null);
const classListQuery = ref('');

function getIgnoreClassList(moduleName) {
  const moduleStats = moduleCoverage.value?.get(moduleName);
  return Array.isArray(moduleStats?.ignoreClasses) ? moduleStats.ignoreClasses : [];
}

function getClassEntries(moduleName) {
  const classSourceMap = new Map();

  for (const className of getAutoClassList(moduleName)) {
    if (!classSourceMap.has(className)) {
      classSourceMap.set(className, { auto: false, manual: false, ignore: false });
    }
    classSourceMap.get(className).auto = true;
  }

  for (const className of getManualClassList(moduleName)) {
    if (!classSourceMap.has(className)) {
      classSourceMap.set(className, { auto: false, manual: false, ignore: false });
    }
    classSourceMap.get(className).manual = true;
  }

  for (const className of getIgnoreClassList(moduleName)) {
    if (!classSourceMap.has(className)) {
      classSourceMap.set(className, { auto: false, manual: false, ignore: false });
    }
    classSourceMap.get(className).ignore = true;
  }

  return [...classSourceMap.entries()]
    .map(([name, flags]) => {
      const statusParts = [];
      if (flags.auto) {
        statusParts.push('Auto');
      }
      if (flags.manual) {
        statusParts.push('Manual');
      }
      if (flags.ignore) {
        statusParts.push('Ignored');
      }

      const statusLabel = statusParts.join(' + ') || 'Unknown';
      const statusKey =
        flags.auto && !flags.manual && !flags.ignore
          ? 'auto'
          : !flags.auto && flags.manual && !flags.ignore
            ? 'manual'
            : !flags.auto && !flags.manual && flags.ignore
              ? 'ignored'
              : 'mixed';

      return {
        name,
        statusLabel,
        statusKey,
        hasAuto: flags.auto,
        hasManual: flags.manual,
        hasIgnore: flags.ignore,
        isAvailable: flags.auto || flags.manual,
      };
    })
    .sort((leftEntry, rightEntry) => leftEntry.name.localeCompare(rightEntry.name));
}

function classEntryMatchesGlobalFilters(entry) {
  const normalizedGlobalQuery = globalClassQuery.value.trim().toLowerCase();
  const matchesName = !normalizedGlobalQuery
    || entry.name.toLowerCase().includes(normalizedGlobalQuery);

  const matchesStatus =
    selectedClassStatus.value === 'all'
      || (selectedClassStatus.value === 'auto' && entry.hasAuto)
      || (selectedClassStatus.value === 'manual' && entry.hasManual)
      || (selectedClassStatus.value === 'ignore' && entry.hasIgnore);

  return matchesName && matchesStatus;
}

function getVisibleClassEntries(moduleName) {
  return getClassEntries(moduleName).filter((entry) => classEntryMatchesGlobalFilters(entry));
}

function getFilteredClassEntries(moduleName) {
  const normalizedQuery = classListQuery.value.trim().toLowerCase();
  return getVisibleClassEntries(moduleName).filter((entry) => {
    return !normalizedQuery || entry.name.toLowerCase().includes(normalizedQuery);
  });
}

function getClassStatusClass(entry) {
  return `status-flag-${entry.statusKey}`;
}

const classStatusCounts = computed(() => {
  const counts = new Map(classStatusFilters.map((status) => [status.key, 0]));

  for (const row of allModuleRows.value) {
    for (const entry of getClassEntries(row.module)) {
      counts.set('all', (counts.get('all') || 0) + 1);
      if (entry.hasAuto) {
        counts.set('auto', (counts.get('auto') || 0) + 1);
      }
      if (entry.hasManual) {
        counts.set('manual', (counts.get('manual') || 0) + 1);
      }
      if (entry.hasIgnore) {
        counts.set('ignore', (counts.get('ignore') || 0) + 1);
      }
    }
  }

  return counts;
});

function getTotalClassCount(moduleName) {
  const moduleStats = moduleCoverage.value?.get(moduleName);
  return typeof moduleStats?.totalCount === 'number' && !Number.isNaN(moduleStats.totalCount)
    ? moduleStats.totalCount
    : 0;
}

function getAutoClassList(moduleName) {
  const moduleStats = moduleCoverage.value?.get(moduleName);
  return Array.isArray(moduleStats?.autoClasses) ? moduleStats.autoClasses : [];
}

function getManualClassList(moduleName) {
  const moduleStats = moduleCoverage.value?.get(moduleName);
  return Array.isArray(moduleStats?.manualClasses) ? moduleStats.manualClasses : [];
}

function getCoveragePercent(moduleName) {
  const rawCoverage = moduleCoverage.value?.get(moduleName)?.coveragePercent;
  if (typeof rawCoverage !== 'number' || Number.isNaN(rawCoverage)) {
    return 0;
  }
  return Math.min(100, Math.max(0, rawCoverage));
}

function getClassListPopoverId(moduleName) {
  return `class-list-panel-${String(moduleName || '').replace(/[^a-zA-Z0-9_-]/g, '-')}`;
}

function toggleClassListPopover(moduleName) {
  const isOpening = openClassListPopoverFor.value !== moduleName;
  openClassListPopoverFor.value = isOpening ? moduleName : null;
  classListQuery.value = '';
}

function isClassListPopoverOpen(moduleName) {
  return openClassListPopoverFor.value === moduleName;
}

function hasGlobalClassNameMatch(moduleName) {
  const query = globalClassQuery.value.trim().toLowerCase();
  if (!query) {
    return false;
  }

  return getVisibleClassEntries(moduleName)
    .some((entry) => entry.name.toLowerCase().includes(query));
}

function shouldShowClassListPanel(moduleName) {
  return isClassListPopoverOpen(moduleName) || hasGlobalClassNameMatch(moduleName);
}

function closeClassListPopover() {
  openClassListPopoverFor.value = null;
  classListQuery.value = '';
}

onMounted(async () => {
  try {
    moduleCoverage.value = await getModuleCoverage();
  } catch (error) {
    console.error('Failed to fetch module coverage data', error);
    moduleCoverage.value = new Map();
  }
});

function formatCoverage(value) {
  if (value === undefined || value === null) {
    return '—';
  }
  if (typeof value === 'number') {
    return `${value.toFixed(1)}%`;
  }
  return String(value);
}

function isNotApplicable(value) {
  return String(value || '').toLowerCase() === 'na';
}

function selectStatus(statusKey) {
  selectedStatus.value = statusKey;
}

function selectClassStatus(statusKey) {
  selectedClassStatus.value = statusKey;
}

function getHighlightPartsForQuery(text, rawQuery) {
  const source = String(text || '');
  const query = String(rawQuery || '').trim();

  if (!query) {
    return [{ text: source, matched: false }];
  }

  const lowerSource = source.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const parts = [];
  let fromIndex = 0;
  let matchIndex = lowerSource.indexOf(lowerQuery, fromIndex);

  while (matchIndex !== -1) {
    if (matchIndex > fromIndex) {
      parts.push({ text: source.slice(fromIndex, matchIndex), matched: false });
    }

    parts.push({ text: source.slice(matchIndex, matchIndex + query.length), matched: true });
    fromIndex = matchIndex + query.length;
    matchIndex = lowerSource.indexOf(lowerQuery, fromIndex);
  }

  if (fromIndex < source.length) {
    parts.push({ text: source.slice(fromIndex), matched: false });
  }

  return parts.length ? parts : [{ text: source, matched: false }];
}

function getHighlightParts(text) {
  return getHighlightPartsForQuery(text, searchQuery.value);
}

function getClassNameHighlightParts(className) {
  const query = globalClassQuery.value.trim() || classListQuery.value.trim();
  return getHighlightPartsForQuery(className, query);
}
</script>

<template>
  <div class="module-group">
    <div class="filter-controls">
      <input v-model="searchQuery" type="search" class="search-input" placeholder="Search modules..."
        aria-label="Search modules">

      <div class="status-chips" role="group" aria-label="Filter by status">
        <button v-for="status in statusFilters" :key="status.key" type="button" class="status-chip"
          :class="{ active: selectedStatus === status.key }" @click="selectStatus(status.key)">
          {{ status.label }} ({{ statusCounts.get(status.key) || 0 }})
        </button>
      </div>

      <input v-model="globalClassQuery" type="search" class="search-input" placeholder="Search classes..."
        aria-label="Search classes">

      <div class="status-chips" role="group" aria-label="Filter by class marshalling status">
        <button v-for="status in classStatusFilters" :key="status.key" type="button" class="status-chip"
          :class="{ active: selectedClassStatus === status.key }" @click="selectClassStatus(status.key)">
          {{ status.label }} ({{ classStatusCounts.get(status.key) || 0 }})
        </button>
      </div>
    </div>

    <p v-if="moduleGroups.length === 0" class="empty-state">
      No modules match current filters.
    </p>

    <details v-for="group in moduleGroups" :key="group.name" :open="hasActiveFilters">
      <summary>{{ group.name }} ({{ group.rows.length }})</summary>
      <table class="module-table">
        <thead>
          <tr>
            <th>Module</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="row in group.rows" :key="row.module">
            <tr>
              <td>
                <template v-for="(part, index) in getHighlightParts(row.module)" :key="`${row.module}-${index}`">
                  <mark v-if="part.matched">{{ part.text }}</mark>
                  <template v-else>{{ part.text }}</template>
                </template>
              </td>
              <td>
                <div class="status-content">
                  <template v-if="row.status === 'na'">Unavailable</template>
                  <template v-else-if="isNotApplicable(row.version) || row.status === 'na'">⊘</template>
                  <template v-else>
                    <div class="progress-badge-container">
                      <button type="button" class="progress-badge"
                        :aria-expanded="isClassListPopoverOpen(row.module)"
                        :aria-controls="getClassListPopoverId(row.module)"
                        :style="{ '--progress': `${getCoveragePercent(row.module)}%` }"
                        @click="toggleClassListPopover(row.module)">
                        <span class="progress-badge-fill" aria-hidden="true"></span>
                        <span class="progress-badge-label">
                          {{ formatCoverage(getCoveragePercent(row.module)) }} ·
                          ({{ getAutoClassList(row.module).length + getManualClassList(row.module).length }} /
                          {{ getTotalClassCount(row.module) }}) available
                        </span>
                      </button>
                    </div>
                  </template>
                </div>
              </td>
            </tr>
            <tr v-if="shouldShowClassListPanel(row.module)" :id="getClassListPopoverId(row.module)" class="class-list-row">
              <td colspan="2">
                <div class="class-names-panel" role="region" aria-label="Module class list">
                  <div class="class-names-popover-title">Class list</div>
                  <input v-model="classListQuery" type="search" class="class-list-search-input"
                    placeholder="Filter classes by name..." aria-label="Filter classes by name">

                  <details class="class-list-details" :open="true">
                    <summary>
                      {{ getFilteredClassEntries(row.module).length }} / {{ getVisibleClassEntries(row.module).length }}
                      visible classes
                    </summary>
                    <table class="class-list-table">
                      <thead>
                        <tr>
                          <th>Class</th>
                          <th>Status</th>
                          <th>Available</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="entry in getFilteredClassEntries(row.module)"
                          :key="`${row.module}-${entry.name}`">
                          <td>
                            <a :href="`https://vtk.org/doc/nightly/html/class${entry.name}.html`" target="_blank"
                              rel="noopener noreferrer">
                              <template v-for="(part, partIndex) in getClassNameHighlightParts(entry.name)"
                                :key="`${row.module}-${entry.name}-${partIndex}`">
                                <mark v-if="part.matched">{{ part.text }}</mark>
                                <template v-else>{{ part.text }}</template>
                              </template>
                            </a>
                          </td>
                          <td>
                            <span class="status-flag" :class="getClassStatusClass(entry)">
                              {{ entry.statusLabel }}
                            </span>
                          </td>
                          <td>{{ entry.isAvailable ? 'Yes' : 'No' }}</td>
                        </tr>
                      </tbody>
                    </table>
                    <p v-if="getFilteredClassEntries(row.module).length === 0" class="class-list-empty-state">
                      No classes match this filter.
                    </p>
                  </details>

                  <button v-if="!hasGlobalClassNameMatch(row.module)" type="button" class="status-chip close-panel-button"
                    @click="closeClassListPopover">
                    Close
                  </button>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </details>
  </div>
</template>

<style scoped>
.filter-controls {
  margin-bottom: 0.75rem;
}

.search-input {
  width: 100%;
  padding: 0.4rem 0.6rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 0.4rem;
  margin-bottom: 0.5rem;
}

.status-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.status-chip {
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  padding: 0.2rem 0.65rem;
  font-size: 0.8rem;
  background: transparent;
  color: var(--vp-c-text-2);
  cursor: pointer;
}

.status-chip.active {
  border-color: var(--vp-c-brand-2);
  color: var(--vp-c-brand-2);
  font-weight: 600;
}

.empty-state {
  margin: 0.25rem 0 0.75rem;
  color: var(--vp-c-danger-1);
  font-weight: 600;
}

.module-group summary {
  cursor: pointer;
  font-weight: 600;
}

.module-table {
  width: 100%;
  display: inline-table !important;
}

.module-table td {
  text-align: center;
}

.module-table th {
  text-align: center;
}

.status-content {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 0.1rem;
  width: 100%;
}

.progress-badge-container {
  position: relative;
  margin-top: 0.1rem;
  width: 100%;
}

.progress-badge {
  border: 2px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  border-radius: 999px;
  padding: 0.1rem 0.5rem;
  font-size: 0.72rem;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 100%;
}

.progress-badge:hover {
  border-color: var(--vp-c-brand-1);
}

.progress-badge-fill {
  position: absolute;
  inset: 0;
  width: var(--progress, 0%);
  background: var(--vp-c-brand-2);
  pointer-events: none;
}

.progress-badge-label {
  position: relative;
  z-index: 1;
}

.class-names-popover {
  position: absolute;
  top: calc(100% + 0.25rem);
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
  min-width: 16rem;
  max-width: 24rem;
  max-height: 14rem;
  overflow: auto;
  padding: 0.45rem 0.6rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 0.4rem;
  background: var(--vp-c-bg);
  text-align: left;
  box-shadow: var(--vp-shadow-2);
}

.class-names-popover-title {
  font-size: 0.78rem;
  font-weight: 600;
  margin-bottom: 0.2rem;
}

.class-list-row td {
  text-align: left;
}

.class-names-panel {
  margin: 0.35rem 0 0.55rem;
  padding: 0.55rem 0.65rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 0.4rem;
  background: var(--vp-c-bg-soft);
  text-align: left;
}

.class-list-search-input {
  width: 100%;
  margin-bottom: 0.35rem;
  padding: 0.2rem 0.4rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 0.35rem;
  font-size: 0.75rem;
}

.class-list-details summary {
  cursor: pointer;
  font-size: 0.75rem;
  margin-bottom: 0.35rem;
}

.class-name-strip {
  margin: 0.1rem 0 0.45rem;
  font-size: 0.72rem;
  line-height: 1.35;
}

.class-name-strip-label {
  font-weight: 600;
  margin-right: 0.2rem;
}

.class-name-strip-values a {
  white-space: nowrap;
}

.class-list-table {
  width: 100%;
  display: inline-table !important;
  border-collapse: collapse;
  font-size: 0.72rem;
}

.class-list-table th,
.class-list-table td {
  text-align: left;
  vertical-align: top;
  padding: 0.2rem 0.3rem;
  border-bottom: 1px solid var(--vp-c-divider);
}

.status-flag {
  display: inline-block;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  padding: 0.02rem 0.35rem;
  font-size: 0.66rem;
  white-space: nowrap;
}

.status-flag-auto {
  color: var(--vp-c-brand-1);
}

.status-flag-manual {
  color: var(--vp-c-warning-1);
}

.status-flag-ignored {
  color: var(--vp-c-danger-1);
}

.status-flag-mixed {
  color: var(--vp-c-text-2);
}

.class-list-empty-state {
  margin: 0.35rem 0 0;
  font-size: 0.72rem;
  color: var(--vp-c-text-2);
}

.close-panel-button {
  margin-top: 0.45rem;
}

.class-names-popover ul {
  margin: 0;
  padding-left: 1rem;
}

.class-names-popover li {
  font-size: 0.75rem;
  line-height: 1.35;
}
</style>