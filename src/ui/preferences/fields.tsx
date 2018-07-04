import * as React from 'react'
import { DialogContent } from '../dialog'
import { TextBox } from '../form'
import { Row } from '../layout'
import { Button } from '../button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as Icons from "@fortawesome/free-solid-svg-icons"

interface IFieldsProps {
  readonly fields: Array<string>

  readonly onFieldValueChanged: (index: number, value: string) => void
  readonly onFieldInsert: (index: number) => void
  readonly onFieldRemove: (index: number) => void
}

export class Fields extends React.Component<IFieldsProps, {}> {

  public renderFieldItems() {
    return this.props.fields.map((field: string, index: number) => {
      return (
        <FieldItem 
          key={index}
          index={index}
          value={field}
          onFieldValueChanged={this.props.onFieldValueChanged}
          onFieldInsert={this.props.onFieldInsert}
          onFieldRemove={this.props.onFieldRemove}
        />
      )
    })
  }

  public render() {

    return (
      <DialogContent
        className="fields-container"
      >
        {this.renderFieldItems()}
      </DialogContent>
    )
  }
}

interface IFieldItemProps {
  readonly value: string
  readonly index: number

  readonly onFieldValueChanged: (index: number, value: string) => void
  readonly onFieldInsert: (index: number) => void
  readonly onFieldRemove: (index: number) => void
}

class FieldItem extends React.Component<IFieldItemProps, {}> {
  private onFieldValueChanged = (value: string) => {
    this.props.onFieldValueChanged(this.props.index, value)
  }

  private onFieldInsert = () => {
    this.props.onFieldInsert(this.props.index)
  }

  private onFieldRemove = () => {
    this.props.onFieldRemove(this.props.index)
  }

  public render() {
    return (
      <Row>
        <TextBox
          value={this.props.value}
          onValueChanged={this.onFieldValueChanged}
        />
        <Button
          onClick={this.onFieldRemove}
        >
          <FontAwesomeIcon
            icon={Icons.faMinus}
            size="sm"
          />
        </Button>
        <Button
          onClick={this.onFieldInsert}
        >
          <FontAwesomeIcon
            icon={Icons.faPlus}
            size="sm"
          />
        </Button>
      </Row>
    )
  }

}