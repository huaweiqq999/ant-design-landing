import React from 'react';
import EditorList from 'rc-editor-list';
import EditorProps from './PropsComp';
import EditorChild from './ChildComp';
import { setTemplateData } from '../../../../edit-module/actions';
import { deepCopy, getDataSourceValue, setDataSourceValue } from '../../../../utils';
import tempData from '../../../../templates/template/element/template.config';

class EditorComp extends React.Component {
  onChange = (e) => {
    const cssName = e.cssName;
    const { currentEditData, dispatch, templateData } = this.props;
    const { id } = currentEditData;
    const ids = id.split('-');
    const cid = ids[0].split('_')[0];
    const tempDataSource = tempData[cid].dataSource;
    const currentEditTemplateData = getDataSourceValue(ids[1], tempDataSource);
    const newClassName = `${currentEditTemplateData ? currentEditTemplateData.className : ''} ${cssName}`.trim();
    const newTemplateData = deepCopy(templateData);
    setDataSourceValue(ids, 'className', newClassName, newTemplateData.data.config);
    const data = {
      className: e.className,
      css: e.css,
      mobileCss: e.mobileCss,
      id,
    };
    newTemplateData.data.style = (newTemplateData.data.style || []).filter(c => c.id !== id);
    newTemplateData.data.style.push(data);
    dispatch(setTemplateData(newTemplateData));
  }

  onPropsChange = (key, value, func) => {
    const { dispatch, templateData, currentEditData } = this.props;
    const { id } = currentEditData;
    const ids = id.split('-');
    if (func) {
      const dataId = currentEditData.id.split('-')[0];
      const template = {
        ...templateData,
        funcData: {
          [dataId]: {
            [key]: value,
          },
        },
      };
      currentEditData.iframe.postMessage(template, '*');
    } else {
      const newTemplateData = deepCopy(templateData);

      setDataSourceValue(ids, key, value, newTemplateData.data.config);
      dispatch(setTemplateData(newTemplateData));
    }
  }

  onChildChange = (ids, currentData) => {
    const { dispatch, templateData } = this.props;
    const newTemplateData = deepCopy(templateData);
    setDataSourceValue(ids, 'children', currentData.children, newTemplateData.data.config);
    dispatch(setTemplateData(newTemplateData));
  }

  render() {
    const { currentEditData, mediaStateSelect } = this.props;
    if (!currentEditData) {
      return (
        <p className="props-explain">
          请选择左侧进行编辑...
        </p>
      );
    }
    const edit = currentEditData.dom.getAttribute('data-edit');
    return (
      [
        <EditorChild edit={edit} {...this.props} key="child" onChange={this.onChildChange} />,
        <EditorProps edit={edit} {...this.props} key="props" onChange={this.onPropsChange} />,
        <EditorList
          key="css"
          editorElem={currentEditData.dom}
          onChange={this.onChange}
          cssToDom={false} // 避免多次样式。
          isMobile={mediaStateSelect === 'Mobile'}
          defaultActiveKey={['EditorClassName', 'EditorState', 'EditorFont', 'EditorInterface']}
        />,
      ]
    );
  }
}
export default EditorComp;
