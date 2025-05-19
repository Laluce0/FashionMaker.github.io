import { useEffect, useRef } from 'react';

/**
 * 自定义Hook，用于管理事件监听器
 * @param {string} eventName - 事件名称
 * @param {Function} handler - 事件处理函数
 * @param {Window|Document|HTMLElement} element - 添加事件监听器的元素，默认为window
 * @param {Array} deps - 依赖项数组，当依赖项变化时会重新添加事件监听器
 */
const useEventListener = (eventName, handler, element = window, deps = []) => {
  // 使用useRef保存最新的handler，避免闭包问题
  const savedHandler = useRef(handler);

  // 当handler变化时更新ref
  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  // 设置或移除事件监听器
  useEffect(() => {
    // 确保element支持addEventListener
    const targetElement = element;
    if (!(targetElement && targetElement.addEventListener)) return;

    // 创建一个调用保存的handler的事件监听器
    const eventListener = (event) => savedHandler.current(event);

    // 添加事件监听器
    targetElement.addEventListener(eventName, eventListener);

    // 清理函数
    return () => {
      targetElement.removeEventListener(eventName, eventListener);
    };
  }, [eventName, element, ...deps]); // 当eventName, element或deps中的任何一项变化时重新运行
};

export default useEventListener;