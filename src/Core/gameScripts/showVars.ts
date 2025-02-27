import {ISentence} from '@/interface/coreInterface/sceneInterface';
import {IPerform} from '@/interface/coreInterface/performInterface';
import styles from '../../Components/Stage/TextBox/textbox.module.scss';
import {getRandomPerformName} from '@/Core/controller/perform/getRandomPerformName';
import {webgalStore} from "@/store/store";
import {setStage} from "@/store/stageReducer";
import {logger} from "@/Core/util/etc/logger";
import {webgal_env} from "@/env/webgal-env";

/**
 * 进行普通对话的显示
 * @param sentence 语句
 * @return {IPerform} 执行的演出
 */
export const showVars = (sentence: ISentence): IPerform => {
  const stageState = webgalStore.getState().stage;
  const userDataState = webgalStore.getState().userData;
  const dispatch = webgalStore.dispatch;
  // 设置文本显示
  dispatch(setStage({key: "showText", value: JSON.stringify(stageState.GameVar)}));
  dispatch(setStage({key: "showName", value: '展示变量'}));
  logger.debug('展示变量：', stageState.GameVar);
  setTimeout(() => {
    const textElements = document.querySelectorAll('.' + styles.TextBox_textElement_start);
    const textArray = [...textElements];
    textArray.forEach((e) => {
      e.className = styles.TextBox_textElement;
    });
  }, 0);
  const performInitName: string = getRandomPerformName();
  const textDelay = webgal_env.textInitialDelay - 20 * userDataState.optionData.textSpeed;
  const endDelay = 750 - userDataState.optionData.textSpeed * 250;
  return {
    performName: performInitName,
    duration: sentence.content.length * textDelay + endDelay,
    isOver: false,
    isHoldOn: false,
    stopFunction: () => {
      const textElements = document.querySelectorAll('.' + styles.TextBox_textElement);
      const textArray = [...textElements];
      textArray.forEach((e) => {
        e.className = styles.TextBox_textElement_Settled;
      });
    },
    blockingNext: () => false,
    blockingAuto: () => true,
    stopTimeout: undefined, // 暂时不用，后面会交给自动清除
  };
};
