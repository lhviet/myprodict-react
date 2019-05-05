import { AnyAction } from 'redux';
import { ActionsObservable, ofType } from 'redux-observable';
import { switchMap } from 'rxjs/operators';
import { WORD__DETAIL_FETCH, WORD__SEARCH } from '../ducks/word';
import { actionSearchMeansOfWord } from '../ducks/meaning';
import { actionSearchUsagesOfWord } from '../ducks/meaning_usage';
import { actionSearchPronOfWord } from '../ducks/pronunciation';
import { actionSearchExamples } from '../ducks/meaning_usage_example';
import { from } from 'rxjs/internal/observable/from';

export const epicFetchWordData = (action$: ActionsObservable<AnyAction>) => action$.pipe(
  ofType(`${WORD__SEARCH}_DONE`, `${WORD__DETAIL_FETCH}_DONE`),
  switchMap((action: AnyAction) => {
    const {models} = action.data;

    if (models && models.length > 0) {
      const wordKeyids = models.map((model: any) => model.keyid);

      const actions = [
        actionSearchMeansOfWord(wordKeyids),
        actionSearchUsagesOfWord(wordKeyids),
        actionSearchPronOfWord(wordKeyids),
      ];

      return action.type === `${WORD__DETAIL_FETCH}_DONE` ?
        from([
          actionSearchExamples(models[0].value.word),
          ...actions,
        ]) :
        from(actions);
    }
    return [{type: 'done'}];
  })
);
