<script setup>
import { computed } from 'vue'
import featuresData from '../../../roadmap/features.json'

const props = defineProps({
	versionGroup: {
		type: String,
		default: 'planned',
	},
	featureVersionGroup: {
		type: Object,
		default: null,
	},
})

const resolvedGroup = computed(() => {
	if (props.featureVersionGroup) {
		return props.featureVersionGroup
	}

	return featuresData.featureVersionGroups?.[props.versionGroup] || {
		description: props.versionGroup,
		features: [],
	}
})

const rows = computed(() => {
	return (resolvedGroup.value?.features || [])
		.map((featureEntry) => {
			const [id, item] = Object.entries(featureEntry || {})[0] || []
			if (!id || !item) {
				return null
			}
			return { id, ...item }
		})
		.filter(Boolean)
})

function isNotApplicable(value) {
	return String(value || '').toLowerCase() === 'na'
}
</script>

<template>
	<table class="roadmap-table">
		<thead class="roadmap-head">
			<tr>
				<th>Feature</th>
				<th>Status</th>
			</tr>
		</thead>
		<tbody>
			<tr v-for="row in rows" :key="row.id">
				<td>{{ row.description }}</td>
				<td>
					<div class="status-cell">
						<template v-if="row.status === 'implemented'">
							<div>✓</div>
							<small>{{ row.version || '—' }}</small>
						</template>
						<template v-else-if="isNotApplicable(row.version) || row.status === 'na'">⊘</template>
						<template v-else-if="row.status === 'planned'">WIP</template>
						<template v-else>—</template>
					</div>
				</td>
			</tr>
		</tbody>
	</table>
</template>

<style scoped>

.roadmap-table {
    width: 100%;
    display: inline-table !important;
}

.roadmap-head th {
	text-align: center;
}

.roadmap-table td {
	text-align: center;
}

.status-cell {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.stage-row th {
	text-align: center;
}
</style>
