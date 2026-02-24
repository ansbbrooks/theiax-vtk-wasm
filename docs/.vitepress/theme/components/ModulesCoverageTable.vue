<script setup>
import { computed } from 'vue';
import featuresData from '../../../roadmap/features.json';

const props = defineProps({
	moduleGroup: {
		type: String,
		default: 'serialized',
	},
});

const serializedModuleRows = computed(() => {
  const entries = Object.entries(featuresData.moduleSerialization?.serializedModules || {})
  return entries
    .map(([module, item]) => ({ module, ...item }))
    .sort((a, b) => a.module.localeCompare(b.module))
});

function getModuleGroupName(moduleName) {
  const moduleId = String(moduleName || '').split('::')[1] || '';
  if (!moduleId) {
    return 'Other';
  }
  if (moduleId.startsWith('GeoVis')) {
    return 'GeoVis';
  }
  if (moduleId.startsWith('IO')) {
    return 'IO';
  }

  const match = moduleId.match(/^[A-Z][a-z]*/);
  return match ? match[0] : 'Other';
}

const serializedModuleGroups = computed(() => {
  const groups = new Map();

  serializedModuleRows.value.forEach((row) => {
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

const notSerializedRows = computed(() => {
  return [...(featuresData.moduleSerialization?.notSerializedModules || [])].sort((a, b) =>
    a.localeCompare(b)
  );
})

const notSerializedModuleGroups = computed(() => {
  const groups = new Map();

  notSerializedRows.value.forEach((module) => {
    const groupName = getModuleGroupName(module);
    if (!groups.has(groupName)) {
      groups.set(groupName, []);
    }
    groups.get(groupName).push(module);
  })

  return Array.from(groups.entries())
    .map(([name, modules]) => ({ name, modules }))
    .sort((a, b) => a.name.localeCompare(b.name));
})

function formatCoverage(value) {
  if (value === undefined || value === null || value === 'na') {
    return '—';
  }
  if (typeof value === 'number') {
    return `${value}%`;
  }
  return String(value);
}

function formatMissingClasses(classes) {
  if (!Array.isArray(classes) || classes.length === 0) {
    return '—';
  }
  return classes.join(', ');
}

function isNotApplicable(value) {
  return String(value || '').toLowerCase() === 'na';
}
</script>

<template>
  <template v-if="props.moduleGroup=='serialized'">
    <div class="module-group">
      <details v-for="group in serializedModuleGroups" :key="group.name">
        <summary>{{ group.name }} ({{ group.rows.length }})</summary>
        <table class="module-table">
          <thead>
            <tr>
              <th>Module</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in group.rows" :key="row.module">
              <td>{{ row.module }}</td>
              <td>
                  <div>
                      <template v-if="row.status === 'fully-implemented'">
                          <div>✓</div>
                          <small>{{ row.version || '—' }}</small>
                      </template>
                      <template v-else-if="isNotApplicable(row.version) || row.status === 'na'">⊘</template>
                      <template v-else-if="row.status === 'planned' || row.status === 'partially-implemented'">WIP</template>
                      <template v-else>—</template>
                  </div>
              </td>
            </tr>
          </tbody>
        </table>
      </details>
    </div>
  </template>

  <template v-else-if="props.moduleGroup=='not-serialized'">
    <div class="module-group">
      <details
        v-for="group in notSerializedModuleGroups"
        :key="group.name"
        class="module-group"
      >
        <summary>{{ group.name }} ({{ group.modules.length }})</summary>
        <table class="module-table">
          <thead>
            <tr>
              <th>Module</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="module in group.modules" :key="module">
              <td>{{ module }}</td>
            </tr>
          </tbody>
        </table>
      </details>
    </div>
  </template>
</template>

<style scoped>
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
</style>