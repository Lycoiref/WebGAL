import styles from './backlog.module.scss';
import {runtime_currentBacklog} from '@/Core/runtime/backlog';
import {CloseSmall, Return, VolumeNotice} from '@icon-park/react';
import {jumpFromBacklog} from '@/Core/controller/storage/jumpFromBacklog';
import {useDispatch, useSelector} from "react-redux";
import {RootState, webgalStore} from '@/store/store';
import {setVisibility} from "@/store/GUIReducer";
import {logger} from "@/Core/util/etc/logger";
import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";


export const Backlog = () => {
  // logger.info('Backlog render');
  const GUIStore = useSelector((state: RootState) => state.GUI);
  const dispatch = useDispatch();
  const [indexHide, setIndexHide] = useState(false);
  const [isDisableScroll, setIsDisableScroll] = useState(false);
  let timeRef = useRef<ReturnType<typeof setTimeout>>();
  // 缓存一下vdom
  const backlogList = useMemo<any>(() => {
    let backlogs = [];
    // logger.info('backlogList render');
    for (let i = 0; i < runtime_currentBacklog.length; i++) {
      const backlogItem = runtime_currentBacklog[i];
      const singleBacklogView = (
        <div
          className={styles.backlog_item}
          style={{animationDelay: `${20 * (runtime_currentBacklog.length - i)}ms`}}
          key={'backlogItem' + backlogItem.currentStageState.showText + backlogItem.saveScene.currentSentenceId}
        >
          <div className={styles.backlog_func_area}>
            {backlogItem.currentStageState.showName !== '' && <div className={styles.backlog_item_content_name}>
              {backlogItem.currentStageState.showName}
              {/* {backlogItem.currentStageState.showName === '' ? '' : '：'} */}
            </div>}
            <div className={styles.backlog_item_button_list}>
              <div
                onClick={(e) => {
                  jumpFromBacklog(i);
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className={styles.backlog_item_button_element}
              >
                <Return theme="outline" size="23" fill="#ffffff" strokeWidth={3}/>
              </div>
              {
                backlogItem.currentStageState.vocal ? <div onClick={() => {
                  // 获取到播放 backlog 语音的元素
                  const backlog_audio_element: any = document.getElementById('backlog_audio_play_element_' + i);
                  if (backlog_audio_element) {
                    backlog_audio_element.currentTime = 0;
                    const userDataStore = webgalStore.getState().userData;
                    const mainVol = userDataStore.optionData.volumeMain;
                    backlog_audio_element.volume = mainVol * 0.01 * userDataStore.optionData.vocalVolume * 0.01;
                    backlog_audio_element.play();
                  }
                }} className={styles.backlog_item_button_element}>
                  <VolumeNotice theme="outline" size="23" fill="#ffffff" strokeWidth={3}/>
                </div> : null
              }
            </div>
          </div>
          <div className={styles.backlog_item_content}>
            <span className={styles.backlog_item_content_text}>{backlogItem.currentStageState.showText}</span>
          </div>
          <audio id={'backlog_audio_play_element_' + i} src={backlogItem.currentStageState.vocal}/>
        </div>
      );
      backlogs.unshift(singleBacklogView);
    }
    return backlogs;
  }, [runtime_currentBacklog.length]);
  useEffect(() => {
    /* 切换为展示历史记录时触发 */
    if (GUIStore.showBacklog) {
      // logger.info('展示backlog');
      // 立即清除 防止来回滚动时可能导致的错乱
      if (timeRef.current) {
        clearTimeout(timeRef.current);
      }
      // setIsDisableScroll(false);
      // 重新把index调回正数
      setIndexHide(false);
      // 向上滑动触发回想时会带着backlog一起滑一下 我也不知道为什么，可能是我的鼠标问题 所以先ban掉滚动
      setIsDisableScroll(true);
      // nextTick开启滚动
      setTimeout(() => {
        setIsDisableScroll(false);
      }, 0);
    } else {
      /* 隐藏历史记录触发 */
      // 这里是为了让backlog的z-index降低
      timeRef.current = setTimeout(() => {
        setIndexHide(true);
        // setIsDisableScroll(false);
        // setIsDisableScroll(true);
        timeRef.current = undefined;
        // 700是和动画一样的延时 保险起见多个80ms
        // 不加也没啥 问题不大
      }, 700 + 80);
    }
  }, [GUIStore.showBacklog]);
  return (
    <>
      {(
        // ${indexHide ? styles.Backlog_main_out_IndexHide : ''}
        <div className={`
          ${GUIStore.showBacklog ? styles.Backlog_main : styles.Backlog_main_out}
          ${indexHide ? styles.Backlog_main_out_IndexHide : ''}
          `}>
          <div className={styles.backlog_top}>
            <CloseSmall
              className={styles.backlog_top_icon}
              onClick={() => {
                dispatch(setVisibility({component: 'showBacklog', visibility: false}));
                dispatch(setVisibility({component: 'showTextBox', visibility: true}));
              }}
              theme="outline"
              size="4em"
              fill="#ffffff"
              strokeWidth={3}
            />
            <div className={styles.backlog_title} onClick={() => {
              logger.info('Rua! Testing');
            }}>回想</div>
          </div>
          <div className={`${styles.backlog_content} ${isDisableScroll ? styles.Backlog_main_DisableScroll : ''}`}>{backlogList}</div>
        </div>
      )}
    </>
  );
};
