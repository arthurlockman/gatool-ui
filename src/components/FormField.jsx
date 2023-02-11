import { Form } from "react-bootstrap"

const FormField = ({ updateTeam, formValue, setFormValue, formDetails }) => {
    var property = formDetails.property + "Local";

    const updateForm = (prop,value) => {
        var update = formValue;
        update[prop] = value;
        setFormValue(update);
    }
    return (
        <Form.Group controlId={formDetails.property}>
            <Form.Label><b>{formDetails.name} ({updateTeam[formDetails.property]} in TIMS)</b></Form.Label>
            <Form.Control className={updateTeam[formDetails.property + "Local"] ? "formHighlight" : formValue[formDetails.property + "Local"] ? "formHighlight" : ""} type="text" placeholder={updateTeam[formDetails.property]} defaultValue={updateTeam[formDetails.property + "Local"] ? updateTeam[formDetails.property + "Local"] : updateTeam[formDetails.property]} onChange={(e) => updateForm(formDetails.property, e.target.value)} />
        </Form.Group>
    )

}

export default FormField
