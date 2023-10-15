EXPORT_DIR = $(OUT_DIR)/fromh2o

all: init copy

init:
	mkdir -p $(EXPORT_DIR)

copy:
	cp -r index.html $(EXPORT_DIR)
	cp -r css $(EXPORT_DIR)
	cp -r js $(EXPORT_DIR)
	cp -r models $(EXPORT_DIR)
