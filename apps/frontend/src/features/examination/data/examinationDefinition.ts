/*

start with the leaves, then connect to the structure
if two leaves only differentiate by their parents, use the same leaf or generator
write functions to create the ids dynamically

*/

// something like this:

import type { PainAspect } from "../model/pain";
import { YES_NO_OPTIONS, type Question } from "../model/question";
import type { RegionId } from "../model/region";

function pain(ctx: { parentId: string; painAspect: PainAspect }): Question {
  const semanticId = joinIds("pain", ctx.painAspect);
  return {
    type: "choice",
    id: joinIds(ctx.parentId, semanticId),
    semanticId, // its the semantic id of this question?  (constant part + aspect)
    /*
    if its just the semantic id stripped from parent context that does not flow into this question
    then this context (region) needs to be inserted into the displayed text somehow (or not even be displayed)
    - does the patient have pain in *this region* vs.
    - does the patient have pain in *temporalis, left side*
    maybe the first one is better, and display region etc where it should be (at parent level)
    will this work for everything?
  */
    multiple: false,
    answerOptions: YES_NO_OPTIONS,
  };
}

function interview(ctx: {
  // how to name the functions consistently, should the name be the same as the constant semantic id part?
  parentId: string;
  region: RegionId;
  painAspects: PainAspect[];
}): Question {
  const semanticId = joinIds("interview", ctx.region);
  const id = joinIds(ctx.parentId, semanticId);
  return {
    id,
    semanticId,
    type: "group",
    questions: ctx.painAspects.map(
      (aspect): Question => pain({ parentId: id, painAspect: aspect })
    ),
  };
}

// here we have pain in the name, but it will actually be added implicitly later, so we could generalize this as something like
// *interview patient about specific symptom* after *did something to patient* or *patient performed action* (depending on active or not).
// maybe its too much generalization and aim for consistency but could be nice...
function painAfterMovement(ctx: { parentId: string; movement: string; active: boolean }): Question {
  const semanticId = joinIds(ctx.movement, ctx.active ? "active" : "passive"); // it could be any combination of parts
  const id = joinIds(ctx.parentId, semanticId); // is this always true? no, e4.b vs. opening-movements.opening.maximum-unassisted
  // this is wrong, it needs to be joinIds(ctx.parentSemanticId, semanticId, or i just dont distinguish them, but then i need to map "e4" to "opening-movements")

  /* i think yes (no), suppose the question is displayed at multiple places in the ui, but with different text 
    one in interactive mode
    one in review mode
    user can input in both, but maybe it renders different text
    id stays same
    content key changes? no, it doesnt change. content includes both texts
    so its just a semantic id?
    semantic id is just what the id "ends with" 
    so we could just use this logic to determine the content
    */
  const basicPainAspects: PainAspect[] = ["present", "familiar"];

  return {
    id,
    type: "group",
    semanticId,
    questions: [],
  };
}

type Symptom = string;
type Action = string;
type Side = string;
type Region = string;

// maybe the generalization could look something like this

function symptomInterviewAfterAction(ctx: {
  parentId: string;
  symptoms: Symptom[]; // not sure about the names here,
  action: Action; // its pretty generic but maybe its fine to start simple, action could be confused with some UI stuff...
  sides: Side[]; // all available sides?
  region: Region[]; // all available regions? probably yes, then everything is generated
  // maybe the DC/TMD defines these terms? or there are commonly used medical/ scientific terms for this in clinical settings
  active: boolean;
}): Question {
  // the semantic id doesnt make sense for groups, because its not unique? but maybe it does make sense... its the headline, but each group should be defined once
  // i need to capture "mouth opening measuerement" as well somehow. the structure is important. its not only semantics. so maybe this function is too general... or just put "interview" into the id
  const semanticId = joinIds(ctx.action, ctx.active ? "active" : "passive", "interview-after"); // the action and active property needs to be defined before because the measurement node needs to be inserted
  // maximal-opening.active.interview-after.left.temporalis.pain.familiar
  // maximal-opening.active.measurement
  /* ok where is the region now. do i do this for all regions (need region ctx variable). pain wasnt defined for region, it was the leaf question
    but here pain is in the symptom ctx variable, its because we will call the pain function evantually, but this means that we dont put the symptom into the semanticId
    wait, why did i make region and side explicit now? where should it be? depends on how questions are grouped. 
    according to dc/tmd the examiner asks one question for a certain region, but actually its more general. the dc/tmd is not really consistent with this.
    in E7 table, the symptom "Click" is at the row and the colums have the condition / sepcification (examiner / patient) but then again the next colums are "painful click" and "familiar pain"
    it describes the process, examiner goes through each row one by one, in this case first click noises are examined and if they are painfull. so the pain is still the symptom, clicking is just the precondition
    i will define them in a separate function... it makes sense to define side and region here.
*/
  const id = joinIds(ctx.parentId, semanticId);

  return {
    id,
    semanticId,
    type: "group",
    questions: ctx.sides.map((side) =>
      symptomInterviewSide({ parentId: id, side, regions, symptoms })
    ),
  };
}

function symptomInterviewSide(ctx: {
  parentId: string;
  side: Side;
  regions: Region[];
  symptoms: Symptom[];
}): Question {
  return {
    id: joinIds(ctx.parentId),
  };
}

function symptomInterview(ctx: { parentId: string; symptom: Symptom }): Question {
  const semanticId = ctx.symptom;
  return {
    id: joinIds(ctx.parentId, ctx.symptom),
    semanticId,
    type: "choice",
    multiple: false,
    answerOptions: YES_NO_OPTIONS,
  };
}

// let's try to define the pain table of E4b with these functions
// we need all the regions and sides, we will type this later
const regions = ["temporalis", "masseter", "tmj"];
const sides = ["right", "left"];
// and the symptoms
const symptoms = ["pain.present", "pain.familiar", "pain.familiar-headache"];

// its one question, everything is one question
const e4b: Question = {
  id: "test.e4.b", // hier verschwimmt die grenze zwischen struktur und semantik (einfach nur semantik nutzen, wenn man "e4" etc später braucht, kann man das abbilden)
  semanticId: "opening-movements.maximum-unassisted-opening",
  type: "group",
  // each side, then each region, then each symptom
  // ok the question is now how is this structured, the function above is too flat, i capture too many arguments at once, each one is its own layer...
  // 0. symptom (pain / familiar pain/...)
  // 1. region
  // 2. side
  // 3. action
  questions: [
    {
      id: "test.e4.b.measurement",
      semanticId: "opening-movements.maximum-unassisted-opening.measurement",
      type: "numeric",
      min: 0,
      max: 150,
    },

    //iterate over sides here? probably yes
    // im lost... random thought: i need some kind of structure like sections etc, given a certain question, i should be able to say in which meaningful group this question is (section, subsection,...)
    // can i do this with the semantic ids, probably yes, can probably map the structure later...

    {id: "remove semantic id later, this becomes semantic id",
        semanticId: "opening-movements.maximum-unassisted-opening.interview",
        type: "group",
        questions: [
            // also iterate over regions here?
            painInterview(ctx: {parentId: "opening-movements.maximum-unassisted-opening.interview", ... })
        ]
    }
    // pain interview for all regions

    painInterview(ctx: {parentId, sides, regions, symptoms}) // need mapping for which symptom is applicable to which region
   
    {
      id: "test.e4.b.interview-after",
      semanticId: "opening-movements.maximum-unassisted-opening.interview",
      type: "group",
      questions: 
    },
  ],
};

function joinIds(...ids: string[]) {
  return ids.join(".");
}

const answers: Record<string, unknown> = {};

const hasFamiliarPainInTemporalisLeft = Object.entries(answers).some(
  ([id, value]) =>
    id.startsWith("id of the questionnaire") && // structural part
    id.endsWith("left.temporalis.pain.familiar") // semantic part
  // the endswith is important vs includes because it makes sure that its a leaf question (no, they are all answers to leaf questions)
);

const hasFamiliarPainInRegionAfterOpening = (region: string) =>
  Object.entries(answers).some(
    ([id, value]) =>
      id.startsWith("id of the questionnaire") && // structural part
      id.includes(region) && // no group questions filtered yet
      id.endsWith("pain.familiar") // the endsWith makes sure only answered questions with full path are considered
    /* 
    idea: define the leaf id parts, always put them in the endsWith function to make sure its well defined
    but the answers already contain only the full paths, so this isnt even necessary
    */
  );

/* what about this?
    ```
    function parseQuestionId(id: string) {
    const parts = id.split(".");
    return {
        region: parts[1],
        side: parts[2],
        domain: parts[3], // pain
        aspect: parts[4], // present
    };
    }   
    ```
  is it useful to assign a fixed position of the id to each property? how to make sure that this is enforced?
  will this capture an existing symmetry or will it make it harder to define ids?
*/

/* ----------------------------------------------
early suggestions

mental model
not a "form definition", it's a domain-specific AST for an examination

risks
- IDs are tied to structure (moving a question changes its meaning) 
    - not right now, maybe later 
    avoid `if (id.startsWith("E4")) ...`, do `if (answers[id] > 35) ...`, 
    that way future refactors don't break logic)
- be aware of implicit assumptions (YES/NO question, single choice, same label everywhere...)

three different layers:
- Question definition → What is being asked
- UI layer → How it’s asked
- Supporting text → Why / how to interpret it

make question definitions semantic, not textual
replace `label: Localized<string>` with `textKey: QuestionTextKey;`
example:
```
type QuestionTextKey =
  | "pain.present"
  | "pain.familiar"
  | "pain.intensity";
```

- avoid generator explosion by adding small config objects (e.g. `options: Partial<Pick<QuestionChoice, "answerOptions">> = {}`)

improvements
- separate ID composition from domain meaning (done)
instead of `function painInterview(groupId: string, region: RegionId, ...)`
something like:
```
function painInterview(ctx: {
  parentId: string;
  region: RegionId;
  painTypes: PainTypeId[];
}) { ... }
```

*/
