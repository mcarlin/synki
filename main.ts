import {
	App,
	FileSystemAdapter,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
	TFile
} from 'obsidian';
import {
	findCards
} from 'api';

interface SynkiSettings {
	defaultDeck?: string;
	ankiConnectUrl: string;
}


async function sync(app: App, settings: SynkiSettings) {
	const adapter = app.vault.adapter;
	if (!(adapter instanceof FileSystemAdapter)) {
		console.error(`Unable to sync, vault adapter is of type ${typeof adapter}`)
		return
	}

	const vaultBasePath = (adapter as FileSystemAdapter).getBasePath();

	let cards = []
	if (settings.defaultDeck) {
		cards = await findCards(settings.ankiConnectUrl, settings.defaultDeck);
		console.log(cards)
	}

	app.vault.getMarkdownFiles().forEach(function (file: TFile, _idx: number, _files: TFile[]) {
		const fileAbsPath = `${vaultBasePath}/${file.path}`
		console.debug(`Syncing ${fileAbsPath}`)
		syncSingle(app)
		console.debug(`Synced ${fileAbsPath}`)
	}, undefined)
}

function syncSingle(app: App) {
	// todo
}

const DEFAULT_SETTINGS: SynkiSettings = {
	ankiConnectUrl: "http://localhost:8765"
}

export default class SynkiPlugin extends Plugin {
	settings: SynkiSettings;

	async onload() {
		await this.loadSettings();
		this.addRibbonIcon('dice', 'Synki', (evt: MouseEvent) => {

			new Notice('Synking!');
			sync(this.app, this.settings)
			new Notice('Synked!');
		});

		this.addCommand({
			id: 'synki-synchronize-all',
			name: 'Synki: Sync with Anki',
			callback: () => {
				sync(this.app, this.settings)
			}
		});

		this.addSettingTab(new SynkiSettingTab(this.app, this));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		return this.saveData(this.settings)
	}
}


class SynkiSettingTab extends PluginSettingTab {
	plugin: SynkiPlugin;

	constructor(app: App, plugin: SynkiPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Default Deck')
			.setDesc('The default deck used to sync cards to. This can be overridden with a property.')
			.addText(text => text
				.setValue(this.plugin.settings.defaultDeck ?? "")
				.onChange(async (value) => {
					this.plugin.settings.defaultDeck = value;
					return this.plugin.saveSettings()
				}));

		new Setting(containerEl)
			.setName('Anki Connect URL')
			.setDesc('The anki connect url to use to sync cards to. If left unspecified, this will use "http://localhost:8765". See https://github.com/FooSoft/anki-connect for more information.')
			.addText(text => text
				.setValue(this.plugin.settings.ankiConnectUrl ?? "http://localhost:8765")
				.onChange(async (value) => {
					this.plugin.settings.ankiConnectUrl = value;
					return this.plugin.saveSettings()
				}));

	}
}
