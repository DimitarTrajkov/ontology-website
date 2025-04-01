import React, { useState } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Select, InputLabel, FormControl, TextField, Button } from "@mui/material";

const MetricDialog = ({ open, onClose, metricRange, onAddFilter }) => {
  const [selectedMetric, setSelectedMetric] = useState("");
  const [fromValue, setFromValue] = useState(0);
  const [toValue, setToValue] = useState(1);

  // Handle Metric Selection
  const handleMetricChange = (event) => {
    const selected = event.target.value;
    setSelectedMetric(selected);
    // Reset the range when metric is changed
    const metric = metricRange.find((metric) => metric.metricName === selected);
    if (metric) {
      setFromValue(metric.from);
      setToValue(metric.to);
    }
  };

  // Handle Range Change
  const handleRangeChange = (e) => {
    const { name, value } = e.target;
    if (name === "from") {
      setFromValue(value);
    } else if (name === "to") {
      setToValue(value);
    }
  };

  // Add Filter
  const handleAddFilter = () => {
    onAddFilter({ metricName: selectedMetric, from: fromValue, to: toValue });
    onClose(); // Close the dialog
  };

  return (
    <Dialog open={open} onClose={onClose} >
      <DialogTitle className="popUpContanierStyle">Select Metric Range</DialogTitle>
      <DialogContent className="popUpContanierStyle">
        <FormControl fullWidth margin="normal">
          <InputLabel>Metric</InputLabel>
          <Select
            className="popUpContanierStyle"
            value={selectedMetric}
            onChange={handleMetricChange}
            label="Metric"
          >
            {metricRange.map((metric, index) => (
              <MenuItem  key={index} value={metric.metricName}>
                {metric.metricName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedMetric && (
          <>
            <TextField
              label="From"
              type="number"
              value={fromValue}
              onChange={handleRangeChange}
              name="from"
              fullWidth
              margin="normal"
              inputProps={{ step: 0.01, min: -1, max: 1 }}
            />
            <TextField
              label="To"
              type="number"
              value={toValue}
              onChange={handleRangeChange}
              name="to"
              fullWidth
              margin="normal"
              inputProps={{ step: 0.01, min: -1, max: 1 }}
            />
          </>
        )}
      </DialogContent>
      <DialogActions className="popUpContanierStyle">
        <Button onClick={onClose} color="primary">Cancel</Button>
        <Button onClick={handleAddFilter} color="primary">Add</Button>
      </DialogActions>
    </Dialog>
  );
};

export default MetricDialog;
