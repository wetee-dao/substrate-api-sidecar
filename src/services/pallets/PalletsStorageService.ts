// Copyright 2017-2025 Parity Technologies (UK) Ltd.
// This file is part of Substrate API Sidecar.
//
// Substrate API Sidecar is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { ApiDecoration } from '@polkadot/api/types';
import { Text } from '@polkadot/types';
import { BlockHash, StorageEntryMetadataV14 } from '@polkadot/types/interfaces';
import { stringCamelCase } from '@polkadot/util';
import { IPalletStorage, IPalletStorageItem, ISanitizedStorageItemMetadata } from 'src/types/responses';

import { sanitizeNumbers } from '../../sanitize/sanitizeNumbers';
import { AbstractPalletsService } from '../AbstractPalletsService';

interface IFetchPalletArgs {
	hash: BlockHash;
	palletId: string;
}

interface IFetchStorageItemArgs extends IFetchPalletArgs {
	storageItemId: string;
	keys: string[];
	metadata: boolean;
}

export class PalletsStorageService extends AbstractPalletsService {
	async fetchStorageItem(
		historicApi: ApiDecoration<'promise'>,
		{ hash, palletId, storageItemId, keys, metadata }: IFetchStorageItemArgs,
	): Promise<IPalletStorageItem> {
		const metadataFieldType = 'storage';
		const chosenMetadata = historicApi.registry.metadata;
		const [palletMeta, palletMetaIdx] = this.findPalletMeta(chosenMetadata, palletId, metadataFieldType);
		const palletName = stringCamelCase(palletMeta.name);

		// Even if `storageItemMeta` is not used, we call this function to ensure it exists. The side effects
		// of the storage item not existing are that `getStorageItemMeta` will throw.
		const storageItemMeta = this.findPalletFieldItemMeta(
			historicApi,
			palletMeta,
			storageItemId,
			metadataFieldType,
		) as StorageEntryMetadataV14;

		let normalizedStorageItemMeta: ISanitizedStorageItemMetadata | undefined;
		if (metadata) {
			normalizedStorageItemMeta = this.normalizeStorageItemMeta(storageItemMeta);
		}

		const [value, { number }] = await Promise.all([
			historicApi.query[palletName][storageItemId](...keys),
			this.api.rpc.chain.getHeader(hash),
		]);

		return {
			at: {
				hash: hash,
				height: number.unwrap().toString(10),
			},
			pallet: palletName,
			palletIndex: palletMetaIdx,
			storageItem: storageItemId,
			keys,
			value,
			metadata: normalizedStorageItemMeta,
		};
	}

	async multiStorageQuery(
		historicApi: ApiDecoration<'promise'>,
		{ hash, palletId, storageItemId, keys, metadata }: IFetchStorageItemArgs,
	): Promise<any> {
		const metadataFieldType = 'storage';
		const chosenMetadata = historicApi.registry.metadata;
		const [palletMeta, palletMetaIdx] = this.findPalletMeta(chosenMetadata, palletId, metadataFieldType);
		const palletName = stringCamelCase(palletMeta.name);

		// Even if `storageItemMeta` is not used, we call this function to ensure it exists. The side effects
		// of the storage item not existing are that `getStorageItemMeta` will throw.
		const storageItemMeta = this.findPalletFieldItemMeta(
			historicApi,
			palletMeta,
			storageItemId,
			metadataFieldType,
		) as StorageEntryMetadataV14;

		let normalizedStorageItemMeta: ISanitizedStorageItemMetadata | undefined;
		if (metadata) {
			normalizedStorageItemMeta = this.normalizeStorageItemMeta(storageItemMeta);
		}

		let ps: any[] = []
		if (keys.length == 1) {
			let ks = keys[0];
			ps = [JSON.parse(decodeURIComponent(ks))];
		} else if (keys.length == 2) {
			let ks = keys[1];
			ps = [keys[0], JSON.parse(decodeURIComponent(ks))];
		}

		console.log(ps)
		const [value, { number }] = await Promise.all([
			//@ts-ignore
			historicApi.query[palletName][storageItemId].multi(...ps),
			this.api.rpc.chain.getHeader(hash),
		]);

		let values: any = []
		value.forEach((exposure) => {
			values.push(exposure.toHuman())
		});


		return {
			at: {
				hash: hash,
				height: number.unwrap().toString(10),
			},
			pallet: palletName,
			palletIndex: palletMetaIdx,
			storageItem: storageItemId,
			keys,
			values,
			metadata: normalizedStorageItemMeta,
		};
	}

	async entriesStorage(
		historicApi: ApiDecoration<'promise'>,
		{ hash, palletId, storageItemId, keys, metadata }: IFetchStorageItemArgs,
	): Promise<any> {
		const metadataFieldType = 'storage';
		const chosenMetadata = historicApi.registry.metadata;
		const [palletMeta, palletMetaIdx] = this.findPalletMeta(chosenMetadata, palletId, metadataFieldType);
		const palletName = stringCamelCase(palletMeta.name);

		// Even if `storageItemMeta` is not used, we call this function to ensure it exists. The side effects
		// of the storage item not existing are that `getStorageItemMeta` will throw.
		const storageItemMeta = this.findPalletFieldItemMeta(
			historicApi,
			palletMeta,
			storageItemId,
			metadataFieldType,
		) as StorageEntryMetadataV14;

		let normalizedStorageItemMeta: ISanitizedStorageItemMetadata | undefined;
		if (metadata) {
			normalizedStorageItemMeta = this.normalizeStorageItemMeta(storageItemMeta);
		}

		const [value, { number }] = await Promise.all([
			historicApi.query[palletName][storageItemId].entries(...keys),
			this.api.rpc.chain.getHeader(hash),
		]);


		let values: any = []
		value.forEach(([key, exposure]) => {
			const k = key.toHuman()
			values.push({
				keys: k,
				value: exposure.toHuman()
			})
		});

		return {
			at: {
				hash: hash,
				height: number.unwrap().toString(10),
			},
			pallet: palletName,
			palletIndex: palletMetaIdx,
			storageItem: storageItemId,
			keys,
			values,
			metadata: normalizedStorageItemMeta,
		};
	}

	async keyStorage(
		historicApi: ApiDecoration<'promise'>,
		{ hash, palletId, storageItemId, keys, metadata }: IFetchStorageItemArgs,
	): Promise<any> {
		const metadataFieldType = 'storage';
		const chosenMetadata = historicApi.registry.metadata;
		const [palletMeta, palletMetaIdx] = this.findPalletMeta(chosenMetadata, palletId, metadataFieldType);
		const palletName = stringCamelCase(palletMeta.name);

		// Even if `storageItemMeta` is not used, we call this function to ensure it exists. The side effects
		// of the storage item not existing are that `getStorageItemMeta` will throw.
		const storageItemMeta = this.findPalletFieldItemMeta(
			historicApi,
			palletMeta,
			storageItemId,
			metadataFieldType,
		) as StorageEntryMetadataV14;

		let normalizedStorageItemMeta: ISanitizedStorageItemMetadata | undefined;
		if (metadata) {
			normalizedStorageItemMeta = this.normalizeStorageItemMeta(storageItemMeta);
		}

		const [value, { number }] = await Promise.all([
			historicApi.query[palletName][storageItemId].keys(...keys),
			this.api.rpc.chain.getHeader(hash),
		]);


		let values: any = []
		value.forEach((key) => {
			const k = key.toHuman()
			values.push(k)
		});

		return {
			at: {
				hash: hash,
				height: number.unwrap().toString(10),
			},
			pallet: palletName,
			palletIndex: palletMetaIdx,
			storageItem: storageItemId,
			keys,
			values,
			metadata: normalizedStorageItemMeta,
		};
	}

	async fetchStorage(
		historicApi: ApiDecoration<'promise'>,
		{ hash, palletId, onlyIds }: IFetchPalletArgs & { onlyIds: boolean },
	): Promise<IPalletStorage> {
		const metadataFieldType = 'storage';
		const chosenMetadata = historicApi.registry.metadata;
		const [palletMeta, palletMetaIdx] = this.findPalletMeta(chosenMetadata, palletId, metadataFieldType);

		let items: [] | ISanitizedStorageItemMetadata[] | Text[];
		if (palletMeta.storage.isNone) {
			items = [];
		} else if (onlyIds) {
			items = palletMeta.storage.unwrap().items.map((itemMeta) => itemMeta.name);
		} else {
			items = palletMeta.storage.unwrap().items.map((itemMeta) => this.normalizeStorageItemMeta(itemMeta));
		}

		const { number } = await this.api.rpc.chain.getHeader(hash);

		return {
			at: {
				hash: hash,
				height: number.unwrap().toString(10),
			},
			pallet: stringCamelCase(palletMeta.name),
			palletIndex: palletMetaIdx,
			items,
		};
	}

	/**
	 * Normalize storage item metadata by running it through `sanitizeNumbers` and
	 * converting the docs section from an array of strings to a single string
	 * joined with new line characters.
	 *
	 * @param storageItemMeta polkadot-js StorageEntryMetadataV14
	 */
	private normalizeStorageItemMeta(storageItemMeta: StorageEntryMetadataV14): ISanitizedStorageItemMetadata {
		const normalizedStorageItemMeta = sanitizeNumbers(storageItemMeta) as unknown as ISanitizedStorageItemMetadata;

		normalizedStorageItemMeta.docs = this.sanitizeDocs(storageItemMeta.docs);

		return normalizedStorageItemMeta;
	}
}
