import {runtime_gamePlay} from '../../runtime/gamePlay';
// import {logger} from '../../util/logger';
import styles from '../../../Components/UI/BottomControlPanel/bottomControlPanel.module.scss';
import {webgalStore} from '@/store/store';
import {nextSentence} from "@/Core/controller/gamePlay/nextSentence";

/**
 * 设置 autoplay 按钮的激活与否
 * @param on
 */
const setButton = (on: boolean) => {
  const autoIcon = document.getElementById('Button_ControlPanel_auto');
  if (autoIcon) {
    if (on) {
      autoIcon.className = styles.button_on;
    } else autoIcon.className = styles.singleButton;
  }
};

/**
 * 停止自动播放
 */
export const stopAuto = () => {
  runtime_gamePlay.isAuto = false;
  setButton(false);
  if (runtime_gamePlay.autoInterval !== null) {
    clearInterval(runtime_gamePlay.autoInterval);
    runtime_gamePlay.autoInterval = null;
  }
  if (runtime_gamePlay.autoTimeout !== null) {
    clearTimeout(runtime_gamePlay.autoTimeout);
    runtime_gamePlay.autoTimeout = null;
  }
};

/**
 * 切换自动播放状态
 */
export const switchAuto = () => {
  // 现在正在自动播放
  if (runtime_gamePlay.isAuto) {
    runtime_gamePlay.isAuto = false;
    setButton(false);
    if (runtime_gamePlay.autoInterval !== null) {
      clearInterval(runtime_gamePlay.autoInterval);
      runtime_gamePlay.autoInterval = null;
    }
  } else {
    // 当前不在自动播放
    runtime_gamePlay.isAuto = true;
    setButton(true);
    runtime_gamePlay.autoInterval = setInterval(autoPlay, 100);
  }
};

export const autoNextSentence = () => {
  nextSentence();
  runtime_gamePlay.autoTimeout = null;
};

/**
 * 自动播放的执行函数
 */
const autoPlay = () => {
  const delay = webgalStore.getState().userData.optionData.autoSpeed;
  const autoPlayDelay = 750 - 250 * delay;
  let isBlockingAuto = false;
  runtime_gamePlay.performList.forEach((e) => {
    if (e.blockingAuto() && !e.isOver)
      // 阻塞且没有结束的演出
      isBlockingAuto = true;
  });
  if (isBlockingAuto) {
    // 有阻塞，提前结束
    return;
  }
  // nextSentence();
  if (runtime_gamePlay.autoTimeout === null) {
    runtime_gamePlay.autoTimeout = setTimeout(autoNextSentence, autoPlayDelay);
  }
};
