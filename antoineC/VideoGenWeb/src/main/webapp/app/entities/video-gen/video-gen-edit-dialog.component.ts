import {Component, OnInit, OnDestroy, ViewChild, ElementRef} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import {JhiAlertService, JhiEventManager} from 'ng-jhipster';

import { VideoGen } from './video-gen.model';
import { VideoGenPopupService } from './video-gen-popup.service';
import { VideoGenService } from './video-gen.service';
import {Observable} from "rxjs/Observable";
import {User} from "../../shared/user/user.model";
import {ResponseWrapper} from "../../shared/model/response-wrapper.model";
import {Principal} from "../../shared/auth/principal.service";
import {UserService} from "../../shared/user/user.service";
import {JhiAlertErrorComponent} from "../../shared/alert/alert-error.component";

@Component({
    selector: 'jhi-video-gen-edit-dialog',
    templateUrl: './video-gen-edit-dialog.component.html'
})
export class VideoGenEditDialogComponent {

    videoGen: VideoGen;
    isSaving: boolean;

    @ViewChild('error') error: JhiAlertErrorComponent;
    @ViewChild('fileField') fileField: ElementRef;
    @ViewChild('assetsField') assetsField: ElementRef;

    users: User[];

    constructor(
        private principal: Principal,
        public activeModal: NgbActiveModal,
        private jhiAlertService: JhiAlertService,
        private videoGenService: VideoGenService,
        private userService: UserService,
        private eventManager: JhiEventManager,
    ) {
    }

    ngOnInit() {
        this.isSaving = false;

        this.userService.query()
            .subscribe((res: ResponseWrapper) => {
                this.users = res.json;
                this.principal.identity().then((account) => {
                    this.videoGen.owner = this.users.filter(user => user.id == account.id)[0];
                });
            }, (res: ResponseWrapper) => this.onError(res.json));
    }

    copyAccount(account) {
        return {
            id: account.id,
            activated: account.activated,
            email: account.email,
            firstName: account.firstName,
            langKey: account.langKey,
            lastName: account.lastName,
            login: account.login,
            imageUrl: account.imageUrl
        };
    }

    clear() {
        this.activeModal.dismiss('cancel');
    }

    save() {
        if(this.fileField.nativeElement.files.length == 0 || this.assetsField.nativeElement.files == 0) {
            this.error.addErrorAlert("Un fichier videogen ou un fichier média sont manquants !!!");
            return;
        }

        this.isSaving = true;
        if (this.videoGen.id !== undefined) {
            this.subscribeToSaveResponse(
                this.videoGenService.update(this.videoGen, this.fileField.nativeElement.files, this.assetsField.nativeElement.files));
        } else {
            this.subscribeToSaveResponse(
                this.videoGenService.create(this.videoGen, this.fileField.nativeElement.files, this.assetsField.nativeElement.files));
        }
    }

    private subscribeToSaveResponse(result: Observable<VideoGen>) {
        result.subscribe((res: VideoGen) =>
            this.onSaveSuccess(res), (res: Response) => this.onSaveError());
    }

    private onSaveSuccess(result: VideoGen) {
        this.eventManager.broadcast({ name: 'videoGenListModification', content: 'OK'});
        this.isSaving = false;
        this.activeModal.dismiss(result);
    }

    private onSaveError() {
        this.isSaving = false;
    }

    private onError(error: any) {
        this.jhiAlertService.error(error.message, null, null);
    }

    trackUserById(index: number, item: User) {
        return item.id;
    }
}

@Component({
    selector: 'jhi-video-gen-edit-popup',
    template: ''
})
export class VideoGenEditPopupComponent implements OnInit, OnDestroy {

    routeSub: any;

    constructor(
        private route: ActivatedRoute,
        private videoGenPopupService: VideoGenPopupService
    ) {}

    ngOnInit() {
        this.routeSub = this.route.params.subscribe((params) => {
            this.videoGenPopupService
                .open(VideoGenEditDialogComponent as Component, params['id']);
        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}
