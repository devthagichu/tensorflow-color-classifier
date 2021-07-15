import React, { useState, useEffect, useRef } from "react";
import * as tf from "@tensorflow/tfjs";
import { div } from "@tensorflow/tfjs";
import intData from "./colorData.json";

const generateRandomColor = () => {
  return Math.floor(Math.random() * 256);
};

function HomeScreen() {
  const model = useRef();
  const [prediction, setPrediction] = useState();
  const [data, setdata] = useState();
  const [red, setRed] = useState();
  const [green, setGreen] = useState();
  const [blue, setBlue] = useState();
  const [xs, setXs] = useState([]);
  const [ys, setYs] = useState([]);
  const [labels, setLabels] = useState([
    "Red",
    "Green",
    "Blue",
    "Yellow",
    "Brown",
    "Purple",
    "Pink",
    "Grey",
    "Orange",
  ]);

  useEffect(() => {
    model.current = tf.sequential();

    const hidden = tf.layers.dense({
      units: 16,
      inputShape: [3],
      activation: "sigmoid",
    });
    const output = tf.layers.dense({
      units: 9,
      activation: "softmax",
    });
    model.current.add(hidden);
    model.current.add(output);

    const LEARNING_RATE = 0.25;
    const optimizer = tf.train.sgd(LEARNING_RATE);

    model.current.compile({
      optimizer: optimizer,
      loss: "categoricalCrossentropy",
      metrics: ["accuracy"],
    });

    return () => {};
  }, []);

  useEffect(() => {
    setRed(generateRandomColor());
    setGreen(generateRandomColor());
    setBlue(generateRandomColor());
    return () => {};
  }, [data]);

  const onSelectColor = (color) => {
    setdata((oldData) => [...oldData, { red, green, blue, label: color }]);
  };

  const prepData = () => {
    let inputColors = [];
    let outputLabels = [];
    const MAX_RANGE = 255;

    for (let index = 0; index < data.length; index++) {
      const item = data[index];
      inputColors.push([
        item.red / MAX_RANGE,
        item.green / MAX_RANGE,
        item.blue / MAX_RANGE,
      ]);
      outputLabels.push(labels.indexOf(item.label));
    }
    setXs(inputColors);
    setYs(outputLabels);
  };
  async function train() {
    // This is leaking https://github.com/tensorflow/tfjs/issues/457

    let labelsTensor = tf.tensor1d(ys, "int32");

    ysho = tf.oneHot(labelsTensor, 9).cast("float32");
    labelsTensor.dispose();

    await model.current.fit(tf.tensor2d(xs), ysho, {
      shuffle: true,
      validationSplit: 0.1,
      epochs: 100,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          console.log(epoch);
          console.log(logs);
        },
        onBatchEnd: async (batch, logs) => {
          await tf.nextFrame();
        },
        onTrainEnd: () => {
          console.log("finished");
        },
      },
    });
  }
  return (
    <div style={{ textAlign: "center", maxWidth: 900, margin: "0 auto" }}>
      <h1> Training Data 📦</h1>
      <h3>Select Training Data</h3>
      <h3>What color is this?</h3>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: 200,
            height: 200,
            borderRadius: 10,
            borderColor: "#000000",
            borderWidth: 10,
            backgroundColor: `rgb(${red},${green},${blue})`,
          }}
        >
          <span>{prediction}</span>
        </div>

        <div
          style={{
            padding: "1rem",
            display: "flex",
            flexWrap: "wrap",
            // flexDirection: "column",
          }}
        >
          {labels.map((item, idx) => (
            <div
              onClick={() => onSelectColor(item)}
              style={{
                backgroundColor: item,
                padding: ".5rem 1rem",
                margin: ".5rem",
                color: "white",
                borderRadius: ".5rem",
                cursor: "pointer",
              }}
            >
              {idx + "-" + item}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3>1 - Selected Training Data</h3>
        <div
          onClick={() => setdata([])}
          style={{
            margin: ".5rem",
            color: "red",
            cursor: "pointer",
            textTransform: "uppercase",
          }}
        >
          Reset Training Data
        </div>

        <div className="">
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            {data.map((item) => {
              return (
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      borderRadius: 10,
                      margin: ".3rem",
                      width: 100,
                      height: 100,
                      backgroundColor: `rgb(${item.red},${item.green},${item.blue})`,
                    }}
                  >
                    <span>{item.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div>
        <h3>2 - Prepare Selected Training Data from Training</h3>
        <div
          onClick={() => prepData()}
          style={{
            margin: ".5rem",
            color: "red",
            cursor: "pointer",
            textTransform: "uppercase",
          }}
        >
          Prepare Data
        </div>
        <div
          style={{
            display: "flex",
            // flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div>
            <h3>Input Data</h3>
            {xs.map((item) => (
              <div style={{ display: "flex" }}>
                {item.map((itm) => (
                  <div style={{ marginRight: "0.5rem" }}>{itm}</div>
                ))}
              </div>
            ))}
          </div>
          <div>
            <h3>Output Data</h3>
            {ys.map((item) => (
              <div style={{ display: "flex" }}>{item}</div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h3>3 - Create Tensors from the Training Data from Training</h3>
        <div
          onClick={() => train()}
          style={{
            margin: ".5rem",
            color: "red",
            cursor: "pointer",
            textTransform: "uppercase",
          }}
        >
          Create Tensors
        </div>
      </div>
      <div>
        <h3>4 - Create Tensors from the Training Data from Training</h3>
        <div
          onClick={() => {
            tf.tidy(() => {
              const input = tf.tensor2d([[red / 255, green / 255, blue / 255]]);
              let results = model.current.predict(input);

              console.log(results);
              let argMax = results.argMax(1);
              let index = argMax.dataSync()[0];
              let label = labels[index];
              setPrediction(label);
            });
          }}
          style={{
            margin: ".5rem",
            color: "red",
            cursor: "pointer",
            textTransform: "uppercase",
          }}
        >
          Predict the Color
        </div>

        <h1>{prediction}</h1>
      </div>
    </div>
  );
}

export default HomeScreen;
