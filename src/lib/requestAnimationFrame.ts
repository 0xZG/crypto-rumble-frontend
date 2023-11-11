let runList: Array<(t: number) => boolean> = [];
function runing(t: number) {
  runList = runList.filter((fn) => fn(t));
  if (runList.length === 0) return;
  requestAnimationFrame(runing);
}

export const RunFrame = (fn: (t: number) => boolean) => {
  runList.push(fn);
  if (runList.length === 0) requestAnimationFrame(runing);
};
