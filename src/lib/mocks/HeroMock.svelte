<script lang="ts">
	let { skills = [] } = $props();
</script>

<section>
	<h1>Mock Hero Title</h1>
	<p>Skills: {skills.join(', ')}</p>
</section>
