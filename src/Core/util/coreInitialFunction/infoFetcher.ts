import axios from 'axios';
import {logger} from '../etc/logger';
import {assetSetter, fileType} from '../gameAssetsAccess/assetSetter';
import {gameInfo} from '../../runtime/etc';
import {getStorage} from '../../controller/storage/storageController';
import {webgalStore} from "@/store/store";
import {setGuiAsset} from "@/store/GUIReducer";
import {initKey} from "@/hooks/useHotkey";

declare global {
    interface Window {
        renderPromise?: Function;
    }
}
/**
 * 获取游戏信息
 * @param url 游戏信息路径
 */
export const infoFetcher = (url: string) => {
  const GUIState = webgalStore.getState().GUI;
  const dispatch = webgalStore.dispatch;
  axios.get(url).then((r) => {
    let gameConfigRaw: Array<string> = r.data.split('\n'); // 游戏配置原始数据
    gameConfigRaw = gameConfigRaw.map((e) => e.split(';')[0]);
    const gameConfig: Array<Array<string>> = gameConfigRaw.map((e) => e.split(':')); // 游戏配置数据
    logger.info('获取到游戏信息', gameConfig);
    // 按照游戏的配置开始设置对应的状态
    if (GUIState) {
      gameConfig.forEach((e) => {
        // 设置标题背景
        if (e[0] === 'Title_img') {
          const url: string = assetSetter(e[1], fileType.background);
          dispatch(setGuiAsset({asset: 'titleBg', value: url}));
        }
        // 设置标题背景音乐
        if (e[0] === 'Title_bgm') {
          const url: string = assetSetter(e[1], fileType.bgm);
          dispatch(setGuiAsset({asset: 'titleBgm', value: url}));
        }
        if (e[0] === 'Game_name') {
          gameInfo.gameName = e[1];
          document.title = e[1];
        }
        if (e[0] === 'Game_key') {
          gameInfo.gameKey = e[1];
          getStorage();
        }
      });
    }
    window?.renderPromise?.();
    delete window.renderPromise;
    initKey();
  });
};
