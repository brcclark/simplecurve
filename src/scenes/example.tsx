import {Circle, makeScene2D,CubicBezier,Curve,Line,Rect} from '@motion-canvas/2d';
import {createRef,createComputed,makeRef,Vector2,createSignal,linear,Logger, useLogger,any} from '@motion-canvas/core';

export default makeScene2D(function* (view) {
  const c1 = createRef<CubicBezier>();
  const curves: Curve[] = []
  const curCurve = createSignal<Curve>();
  const r1 = createRef<Rect>();
  const r2 = createRef<Rect>();
  const r3 = createRef<Rect>();
  const prog = createSignal(0)
  const prog2 = createSignal(0)
  const curIdx = createSignal(0)
  
  let l = useLogger()

  const totalProg = createComputed(()=>{
    let v = 0;
    //Get how far along the total curve we are
    for (let idx  = 0; idx < curIdx(); idx++) { 
      v += curves[idx].arcLength()
    }
    //l.debug(curIdx()+": " + v.toString() + " along of " + totalLength().toString())
    //Add the current curve's progress
    v = (v + prog() * curCurve().arcLength()) / totalLength()
    //l.debug(v.toString() + " : " + prog().toString())
    return v
  })
  
  //want to define an animation time for the entire curve set
  //Should be split among the curve array members. or otherwise I can just manually set it. ideally we could calculate it but, also, eh, it's easy to determine I think


  const totalLength = createComputed(()=>{
    let t = 0;
    curves.forEach(curve => {
      t += curve.arcLength()
    });
    return t;
  })
  const r2Pos = createComputed(()=>{
      return new Vector2(
          curCurve().getPointAtPercentage(prog()).position.x,
          c1().getPointAtPercentage(totalProg()).position.y,
      )
  })

  view.add(
      <>
          <CubicBezier
        ref={makeRef(curves,0)}
        stroke={'red'}
        lineWidth={10}
        p0={[-400,-50]}
        p1={[-400,-100]}
        p2={[-325,-150]}
        p3={[-275,-150]}
      />
      <Line 
        ref={makeRef(curves,1)}
        stroke={'green'}
        lineWidth={10}
        points={[
          [-275,-150],
          [275,-150]
        ]}
      />
      <CubicBezier
        ref={makeRef(curves,2)}
        stroke={'darkred'}
        lineWidth={10}
        p0={[275,-150]}
        p1={[325,-150]}
        p2={[400,-100]}
        p3={[400,-50]}
      />      
      <CubicBezier
        ref={c1}
        stroke={'darkblue'}
        lineWidth={10}
        p0={[-400,-250]}
        p1={[-300,-560]}
        p2={[100,-200]}
        p3={[400,-250]}
      />
      <Rect
          ref={r1}
          fill={'green'}
          size={30}
          position={()=> curCurve().getPointAtPercentage(prog()).position}
      />
      <Rect
          ref={r2}
          fill={'blue'}
          size={30}
          position={()=> r2Pos()}
      />
      <Rect
          ref={r3}
          fill={'lightgreen'}
          opacity={0}
          size={20}
          position={()=> c1().getPointAtPercentage(prog2()).position}
      />
      </>
  );

  curCurve(curves[0])
  curIdx(0)
  yield* any(prog(1,3 * (1 * curCurve().arcLength() / totalLength()),linear),prog2(1,3,linear))
  l.debug()
  curCurve(curves[1])
  curIdx(curIdx() + 1)
  prog(0)
  yield* prog(1,3 * (1 * curCurve().arcLength() / totalLength()),linear)
  prog(0)
  curCurve(curves[2])
  curIdx(curIdx() + 1)
  yield* prog(1,3 * (1 * curCurve().arcLength() / totalLength()),linear)
})